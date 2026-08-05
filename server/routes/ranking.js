const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SkillVerification = require('../models/SkillVerification');
const ZKProof = require('../models/ZKProof');
const Bid = require('../models/Bid');
const Job = require('../models/Job');

const computePageRank = (nodes, edges, iterations = 20, dampingFactor = 0.85) => {
  const ranks = {};
  const n = nodes.length;
  if (n === 0) return ranks;
  nodes.forEach(node => { ranks[node] = 1 / n; });
  for (let iter = 0; iter < iterations; iter++) {
    const newRanks = {};
    nodes.forEach(node => { newRanks[node] = (1 - dampingFactor) / n; });
    edges.forEach(({ from, to, weight }) => {
      const outWeight = edges.filter(e => e.from === from).reduce((s, e) => s + e.weight, 0);
      if (outWeight > 0) newRanks[to] += dampingFactor * ranks[from] * (weight / outWeight);
    });
    nodes.forEach(node => { ranks[node] = newRanks[node]; });
  }
  return ranks;
};

router.get('/freelancers', async (req, res) => {
  try {
    const { skills } = req.query;
    const requiredSkills = skills ? skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

    const freelancers = await User.find({ role: 'freelancer' }).select('_id username walletAddress');

    if (freelancers.length === 0) {
      return res.json({ rankings: [], graph: { nodes: [], edges: [] }, requiredSkills });
    }

    const freelancerIds = freelancers.map(f => f._id.toString());

    const [allSkills, zkProofs, allBids, completedJobs] = await Promise.all([
      SkillVerification.find({ freelancer: { $in: freelancerIds }, status: 'passed' }),
      ZKProof.find({ freelancer: { $in: freelancerIds } }),
      Bid.find({ freelancer: { $in: freelancerIds } }),
      Job.find({ status: 'completed', hiredFreelancer: { $in: freelancerIds } }),
    ]);

    // Build skill graph
    const skillSet = new Set(allSkills.map(s => s.skill));
    const skillNodes = Array.from(skillSet);

    const graphNodes = [
      ...freelancers.map(f => ({ id: f._id.toString(), type: 'freelancer', label: f.username || f.walletAddress?.slice(0, 8) })),
      ...skillNodes.map(s => ({ id: `skill_${s}`, type: 'skill', label: s })),
    ];

    const graphEdges = [];
    allSkills.forEach(sv => {
      const weight = sv.badgeLevel === 'Gold' ? 3 : sv.badgeLevel === 'Silver' ? 2 : 1;
      graphEdges.push({ from: sv.freelancer.toString(), to: `skill_${sv.skill}`, weight });
      graphEdges.push({ from: `skill_${sv.skill}`, to: sv.freelancer.toString(), weight: weight * 0.5 });
    });

    const allNodes = graphNodes.map(n => n.id);
    const pageRanks = computePageRank(allNodes, graphEdges);

    const scored = freelancers.map(freelancer => {
      const fid = freelancer._id.toString();
      const fSkills = allSkills.filter(s => s.freelancer.toString() === fid);
      const zkProof = zkProofs.find(z => z.freelancer.toString() === fid);
      const bidCount = allBids.filter(b => b.freelancer.toString() === fid).length;
      const jobsCompleted = completedJobs.filter(j => j.hiredFreelancer?.toString() === fid).length;

      const verifiedSkillNames = fSkills.map(s => s.skill.toLowerCase());

      // Skill match score (40 pts max)
      let matchScore = 0;
      if (requiredSkills.length > 0) {
        const matchCount = requiredSkills.filter(s => verifiedSkillNames.includes(s)).length;
        matchScore = Math.round((matchCount / requiredSkills.length) * 40);
      } else {
        matchScore = Math.min(fSkills.length * 8, 40);
      }

      // Badge bonus
      const goldBonus = fSkills.filter(s => s.badgeLevel === 'Gold').length * 3;
      const silverBonus = fSkills.filter(s => s.badgeLevel === 'Silver').length * 2;
      matchScore = Math.min(matchScore + goldBonus + silverBonus, 40);

      // ZK score (30 pts max) — show freelancer even if no ZK proof
      const zkLevel = zkProof?.verifiedLevel;
      const zkScore = zkLevel === 'Expert' ? 30 : zkLevel === 'Trusted' ? 20 : zkLevel === 'Rising' ? 10 : 0;

      // Activity score (20 pts max)
      const activityScore = Math.min(jobsCompleted * 5 + bidCount * 1, 20);

      // PageRank score (10 pts max)
      const prScore = Math.min((pageRanks[fid] || 0) * 1000, 10);

      const totalScore = Math.round(matchScore + zkScore + activityScore + prScore);

      const matchedSkills = requiredSkills.filter(s => verifiedSkillNames.includes(s));

      return {
        freelancer: {
          _id: fid,
          username: freelancer.username || `Freelancer_${fid.slice(-4)}`,
          walletAddress: freelancer.walletAddress,
        },
        scores: {
          matchScore: Math.round(matchScore),
          zkScore,
          activityScore,
          prScore: Math.round(prScore),
          totalScore,
        },
        verifiedSkills: fSkills.map(s => ({
          skill: s.skill,
          badgeLevel: s.badgeLevel,
          badgeEmoji: s.badgeEmoji,
          badgeColor: s.badgeColor,
        })),
        zkProof: zkProof ? {
          level: zkProof.verifiedLevel || 'None',
          emoji: zkProof.verifiedEmoji || '◌',
          color: zkProof.verifiedColor || '#888',
          verified: zkProof.verified || false,
        } : null,
        matchedSkills,
        jobsCompleted,
        bidCount,
        pageRank: parseFloat((pageRanks[fid] || 0).toFixed(6)),
      };
    });

    scored.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

    res.json({
      rankings: scored,
      graph: { nodes: graphNodes, edges: graphEdges },
      requiredSkills,
    });
  } catch (e) {
    console.error('Ranking error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
