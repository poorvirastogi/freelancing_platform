const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const SkillVerification = require('../models/SkillVerification');

// GET /api/recommendations/jobs
// Returns jobs ranked by how well they match freelancer's verified skills
router.get('/jobs', protect, async (req, res) => {
  try {
    const verifiedSkills = await SkillVerification.find({
      freelancer: req.user.userId,
      status: 'passed'
    });

    const openJobs = await Job.find({ status: 'open' })
      .populate('client', 'walletAddress username')
      .sort({ createdAt: -1 });

    if (verifiedSkills.length === 0) {
      return res.json({ jobs: openJobs.map(j => ({ ...j.toObject(), matchScore: 0, matchedSkills: [], recommendation: 'Verify skills to get personalized matches' })) });
    }

    const verifiedSkillNames = verifiedSkills.map(s => s.skill.toLowerCase());
    const goldSkills   = verifiedSkills.filter(s => s.badgeLevel === 'Gold').map(s => s.skill.toLowerCase());
    const silverSkills = verifiedSkills.filter(s => s.badgeLevel === 'Silver').map(s => s.skill.toLowerCase());

    const scoredJobs = openJobs.map(job => {
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const matchedSkills = jobSkills.filter(s => verifiedSkillNames.includes(s));
      const goldMatches   = jobSkills.filter(s => goldSkills.includes(s));
      const silverMatches = jobSkills.filter(s => silverSkills.includes(s));

      // Score: base match % + bonus for gold/silver badges
      let matchScore = jobSkills.length > 0
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0;
      matchScore += goldMatches.length * 10;
      matchScore += silverMatches.length * 5;
      matchScore = Math.min(matchScore, 100);

      let recommendation = '';
      if (matchScore >= 80)      recommendation = '🎯 Perfect Match';
      else if (matchScore >= 60) recommendation = '✅ Strong Match';
      else if (matchScore >= 40) recommendation = '�� Good Match';
      else if (matchScore >= 20) recommendation = '📋 Partial Match';
      else                       recommendation = '🔍 Low Match';

      return {
        ...job.toObject(),
        matchScore,
        matchedSkills,
        goldMatches,
        recommendation,
      };
    });

    // Sort by match score
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ jobs: scoredJobs, verifiedCount: verifiedSkills.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
