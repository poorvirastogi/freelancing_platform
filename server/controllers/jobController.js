const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');

const createJob = async (req, res) => {
  try {
    const { title, description, skills, budget, deadline, milestones } = req.body;
    const job = await Job.create({
      client: req.user.userId,
      title, description, skills, budget, deadline,
      milestones: milestones || [],
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $in: ['open', 'in_progress'] } })
      .populate('client', 'walletAddress username')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'walletAddress username')
      .populate('hiredFreelancer', '_id walletAddress username');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const bids = await Bid.find({ job: req.params.id })
      .populate('freelancer', 'walletAddress username skills');
    res.json({ job, bids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const placeBid = async (req, res) => {
  try {
    const { amount, proposal, deliveryDays } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ error: 'Job not open for bidding' });
    const existingBid = await Bid.findOne({ job: req.params.id, freelancer: req.user.userId });
    if (existingBid) return res.status(400).json({ error: 'You already bid on this job' });

    const bid = await Bid.create({ job: req.params.id, freelancer: req.user.userId, amount, proposal, deliveryDays });

    // Notify client
    await Notification.create({
      user: job.client,
      message: `New bid received on your job: "${job.title}"`,
      type: 'bid_received',
      jobId: job._id,
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user.userId, status: { $ne: 'deleted' } })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user.userId })
      .populate('job', 'title budget status')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete job (soft delete)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    job.status = 'deleted';
    await job.save();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit job
const editJob = async (req, res) => {
  try {
    const { title, description, skills, budget, deadline, milestones } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    if (job.status !== 'open') return res.status(400).json({ error: 'Can only edit open jobs' });
    Object.assign(job, { title, description, skills, budget, deadline, milestones });
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject a bid
const rejectBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('job');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });
    if (bid.job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    bid.status = 'rejected';
    await bid.save();
    await Notification.create({
      user: bid.freelancer,
      message: `Your bid on "${bid.job.title}" was rejected. You can update and rebid.`,
      type: 'bid_rejected',
      jobId: bid.job._id,
    });
    res.json(bid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Release milestone payment
const releaseMilestone = async (req, res) => {
  try {
    const { milestoneIndex } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    if (job.milestones[milestoneIndex]) {
      job.milestones[milestoneIndex].released = true;
      const totalReleased = job.milestones.filter(m => m.released).reduce((sum, m) => sum + m.percentage, 0);
      job.paymentProgress = totalReleased;
      if (totalReleased >= 100) job.status = 'completed';
    }
    await job.save();
    await Notification.create({
      user: job.hiredFreelancer,
      message: `Payment milestone released for "${job.title}"`,
      type: 'payment_released',
      jobId: job._id,
    });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createJob, getJobs, getJobById, placeBid, getMyJobs, getMyBids, deleteJob, editJob, rejectBid, releaseMilestone };