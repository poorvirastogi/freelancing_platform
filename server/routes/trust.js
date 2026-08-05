const express = require('express');
const router = express.Router();
const SkillVerification = require('../models/SkillVerification');
const ZKProof = require('../models/ZKProof');
const Bid = require('../models/Bid');

router.get('/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const [zkProof, skills, bids] = await Promise.all([
      ZKProof.findOne({ freelancer: freelancerId }),
      SkillVerification.find({ freelancer: freelancerId, status: 'passed' }),
      Bid.find({ freelancer: freelancerId }),
    ]);

    let trustScore = 0;
    const breakdown = {};

    // ZK reputation — 40 points
    const zkPoints = zkProof?.verifiedLevel === 'Expert'  ? 40
                   : zkProof?.verifiedLevel === 'Trusted' ? 28
                   : zkProof?.verifiedLevel === 'Rising'  ? 16 : 0;
    trustScore += zkPoints;
    breakdown.zkReputation = { points: zkPoints, level: zkProof?.verifiedLevel || 'None', emoji: zkProof?.verifiedEmoji || '◌' };

    // Verified skills — 40 points max
    const skillPoints = Math.min(skills.length * 8, 40);
    const goldBonus   = skills.filter(s => s.badgeLevel === 'Gold').length   * 3;
    const silverBonus = skills.filter(s => s.badgeLevel === 'Silver').length * 2;
    const totalSkillPoints = Math.min(skillPoints + goldBonus + silverBonus, 40);
    trustScore += totalSkillPoints;
    breakdown.skills = {
      points: totalSkillPoints,
      count: skills.length,
      gold:   skills.filter(s => s.badgeLevel === 'Gold').length,
      silver: skills.filter(s => s.badgeLevel === 'Silver').length,
      bronze: skills.filter(s => s.badgeLevel === 'Bronze').length,
    };

    // Activity — 20 points max
    const activityPoints = Math.min(bids.length * 2, 20);
    trustScore += activityPoints;
    breakdown.activity = { points: activityPoints, totalBids: bids.length };

    trustScore = Math.min(trustScore, 100);

    const trustLabel =
      trustScore >= 80 ? { label: 'Highly Trusted', color: '#FFD700', emoji: '⭐' } :
      trustScore >= 60 ? { label: 'Trusted',         color: '#6ee7b7', emoji: '🛡️' } :
      trustScore >= 40 ? { label: 'Emerging',        color: '#7DA0CA', emoji: '📈' } :
                         { label: 'New',              color: '#888',    emoji: '🌱' };

    res.json({
      trustScore,
      trustLabel,
      breakdown,
      verifiedSkills: skills.map(s => ({
        skill: s.skill,
        badgeLevel: s.badgeLevel,
        badgeEmoji: s.badgeEmoji,
        badgeColor: s.badgeColor,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
