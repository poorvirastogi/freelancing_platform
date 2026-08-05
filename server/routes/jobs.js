const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');

// Public
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $in: ['open', 'in_progress'] } })
      .populate('client', 'walletAddress username')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my/posted', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user.userId, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my/bids', protect, async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user.userId })
      .populate('job', 'title budget status paymentProgress escrowAddress')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'walletAddress username')
      .populate('hiredFreelancer', '_id walletAddress username');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const bids = await Bid.find({ job: req.params.id })
      .populate('freelancer', 'walletAddress username skills');
    res.json({ job, bids });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, skills, budget, deadline, milestones } = req.body;
    const job = await Job.create({
      client: req.user.userId, title, description, skills, budget, deadline,
      milestones: milestones || [],
    });
    res.status(201).json(job);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    if (job.status !== 'open') return res.status(400).json({ error: 'Can only edit open jobs' });
    const { title, description, skills, budget, deadline, milestones } = req.body;
    Object.assign(job, { title, description, skills, budget, deadline, milestones });
    await job.save();
    res.json(job);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    job.status = 'deleted';
    await job.save();
    res.json({ message: 'Job deleted successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/bid', protect, async (req, res) => {
  try {
    const { amount, proposal, deliveryDays } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ error: 'Job not open for bidding' });
    const existing = await Bid.findOne({ job: req.params.id, freelancer: req.user.userId });
    if (existing) return res.status(400).json({ error: 'You already bid on this job' });
    const bid = await Bid.create({ job: req.params.id, freelancer: req.user.userId, amount, proposal, deliveryDays });
    await Notification.create({ user: job.client, message: `New bid on "${job.title}"`, type: 'bid_received', jobId: job._id });
    res.status(201).json(bid);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/hire', protect, async (req, res) => {
  try {
    const { freelancerId, escrowAddress } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    job.hiredFreelancer = freelancerId;
    job.escrowAddress = escrowAddress;
    job.status = 'in_progress';
    await job.save();
    await Notification.create({ user: freelancerId, message: `You were hired for "${job.title}"`, type: 'hired', jobId: job._id });
    res.json(job);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Release milestone payment + update progress
router.post('/:id/milestone', protect, async (req, res) => {
  try {
    const { milestoneIndex } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    if (!job.milestones[milestoneIndex]) return res.status(400).json({ error: 'Milestone not found' });
    if (job.milestones[milestoneIndex].released) return res.status(400).json({ error: 'Already released' });
    job.milestones[milestoneIndex].released = true;
    const totalReleased = job.milestones.filter(m => m.released).reduce((s, m) => s + m.percentage, 0);
    job.paymentProgress = totalReleased;
    if (totalReleased >= 100) {
      job.status = 'completed';
      await Notification.create({ user: job.hiredFreelancer, message: `Job "${job.title}" is fully completed! All payments released.`, type: 'payment_released', jobId: job._id });
    } else {
      await Notification.create({ user: job.hiredFreelancer, message: `Milestone payment released for "${job.title}" — ${totalReleased}% done`, type: 'payment_released', jobId: job._id });
    }
    await job.save();
    res.json(job);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reject bid
router.post('/:id/bid/:bidId/reject', protect, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('job');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });
    bid.status = 'rejected';
    await bid.save();
    await Notification.create({ user: bid.freelancer, message: `Your bid on "${bid.job.title}" was rejected. You may update and rebid.`, type: 'bid_rejected', jobId: bid.job._id });
    res.json(bid);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
