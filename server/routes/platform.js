const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const SkillVerification = require('../models/SkillVerification');

router.get('/stats', async (req, res) => {
  try {
    const [totalFreelancers, totalClients, totalJobs, completedJobs, verifiedSkills] = await Promise.all([
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      Job.countDocuments({ status: { $ne: 'deleted' } }),
      Job.countDocuments({ status: 'completed' }),
      SkillVerification.countDocuments({ status: 'passed' }),
    ]);
    const ethTransacted = await Job.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]);
    res.json({
      totalFreelancers,
      totalClients,
      totalJobs,
      completedJobs,
      verifiedSkills,
      ethTransacted: ethTransacted[0]?.total?.toFixed(3) || "0",
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
