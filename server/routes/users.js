const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, bio, skills, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, bio, skills, role },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/stats — Dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Jobs posted by user
    const postedJobs = await Job.countDocuments({ client: userId });

    // Active jobs (in progress)
    const activeJobs = await Job.countDocuments({
      client: userId,
      status: 'in_progress'
    });

    // Bids placed by user
    const totalBids = await Bid.countDocuments({ freelancer: userId });

    // Accepted bids
    const acceptedBids = await Bid.countDocuments({
      freelancer: userId,
      status: 'accepted'
    });

    // Jobs won (hired as freelancer)
    const jobsWon = await Job.countDocuments({
      hiredFreelancer: userId
    });

    res.json({
      postedJobs,
      activeJobs,
      totalBids,
      acceptedBids,
      jobsWon,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/me — Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-nonce');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;