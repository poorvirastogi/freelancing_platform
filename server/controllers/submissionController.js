const Submission = require('../models/Submission');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const submitWork = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { message, milestoneIndex } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const submission = await Submission.create({
      job: jobId,
      freelancer: req.user.userId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileData: req.file.buffer,
      fileSize: req.file.size,
      message: message || '',
      milestoneIndex: milestoneIndex !== undefined ? parseInt(milestoneIndex) : null,
    });
    await Notification.create({
      user: job.client,
      message: `Work submitted for "${job.title}" — ready for your review`,
      type: 'work_submitted',
      jobId: job._id,
    });
    res.status(201).json({
      _id: submission._id,
      fileName: submission.fileName,
      fileType: submission.fileType,
      fileSize: submission.fileSize,
      message: submission.message,
      status: submission.status,
      milestoneIndex: submission.milestoneIndex,
      createdAt: submission.createdAt,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getSubmissions = async (req, res) => {
  try {
    const subs = await Submission.find({ job: req.params.jobId })
      .populate('freelancer', 'walletAddress username')
      .select('-fileData');
    res.json(subs);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const downloadFile = async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Not found' });
    res.set('Content-Type', sub.fileType);
    res.set('Content-Disposition', `attachment; filename="${sub.fileName}"`);
    res.send(sub.fileData);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { submitWork, getSubmissions, downloadFile };
