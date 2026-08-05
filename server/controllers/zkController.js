const crypto = require('crypto');
const Rating = require('../models/Rating');
const ZKProof = require('../models/ZKProof');

const THRESHOLDS = [
  { level: 'Expert',  min: 4.5, emoji: '⭐', color: '#FFD700', desc: 'Top-tier freelancer' },
  { level: 'Trusted', min: 3.5, emoji: '🛡️', color: '#6ee7b7', desc: 'Reliable and quality work' },
  { level: 'Rising',  min: 2.5, emoji: '📈', color: '#7DA0CA', desc: 'Building reputation' },
];

const computePrivateScore = async (freelancerId) => {
  const ratings = await Rating.find({ freelancer: freelancerId });
  if (ratings.length === 0) return { score: 0, count: 0 };
  // Weighted average — recent ratings count more
  let weightedSum = 0, totalWeight = 0;
  ratings.forEach((r, i) => {
    const weight = 1 + (i / ratings.length); // more recent = higher index = higher weight
    weightedSum += r.score * weight;
    totalWeight += weight;
  });
  const avg = weightedSum / totalWeight;
  return { score: parseFloat(avg.toFixed(2)), count: ratings.length };
};

const generateProof = (score, freelancerId) => {
  const secret = process.env.ZK_SECRET || 'freelance3_zk_secret';
  // Find highest threshold met
  const highestLevel = THRESHOLDS.find(t => score >= t.min) || null;
  const proofHash = crypto
    .createHash('sha256')
    .update(`${freelancerId}:${score.toFixed(2)}:${secret}:${Date.now()}`)
    .digest('hex');
  return { proofHash, highestLevel, allThresholds: THRESHOLDS };
};

// POST /api/zk/rate
const rateFreelancer = async (req, res) => {
  try {
    const { jobId, freelancerId, score, review } = req.body;
    if (score < 1 || score > 5) return res.status(400).json({ error: 'Score must be 1-5' });

    await Rating.findOneAndUpdate(
      { job: jobId, client: req.user.userId },
      { job: jobId, client: req.user.userId, freelancer: freelancerId, score, review },
      { upsert: true, new: true }
    );

    // Recompute proof
    const { score: avgScore, count } = await computePrivateScore(freelancerId);
    const { proofHash, highestLevel } = generateProof(avgScore, freelancerId);

    const proofData = {
      freelancer: freelancerId,
      proofHash,
      threshold: highestLevel?.min || 0,
      verified: !!highestLevel,
      verifiedLevel: highestLevel?.level || 'None',
      verifiedEmoji: highestLevel?.emoji || '◌',
      verifiedColor: highestLevel?.color || '#888',
      publicStatement: highestLevel
        ? `${highestLevel.emoji} ${highestLevel.level}: ${highestLevel.desc}`
        : 'No reputation threshold met yet',
      updatedAt: new Date(),
      verifiedAt: new Date(),
    };

    await ZKProof.findOneAndUpdate(
      { freelancer: freelancerId },
      proofData,
      { upsert: true, new: true }
    );

    res.json({
      message: 'Rating submitted and ZK proof updated',
      proof: {
        verified: !!highestLevel,
        level: highestLevel?.level || 'None',
        publicStatement: proofData.publicStatement,
        proofHash,
      }
    });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'You already rated this job' });
    res.status(500).json({ error: e.message });
  }
};

// GET /api/zk/proof/:freelancerId — public, no raw score ever
const getProof = async (req, res) => {
  try {
    const proof = await ZKProof.findOne({ freelancer: req.params.freelancerId });
    if (!proof) return res.json({
      verified: false,
      level: 'None',
      publicStatement: 'No reputation data yet',
      proofHash: null,
      verifiedEmoji: '◌',
      verifiedColor: '#888',
    });
    res.json({
      verified: proof.verified,
      level: proof.verifiedLevel,
      publicStatement: proof.publicStatement,
      proofHash: proof.proofHash,
      verifiedEmoji: proof.verifiedEmoji,
      verifiedColor: proof.verifiedColor,
      verifiedAt: proof.verifiedAt,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/zk/my-proof — freelancer sees own full data
const getMyProof = async (req, res) => {
  try {
    const proof = await ZKProof.findOne({ freelancer: req.user.userId });
    const { score, count } = await computePrivateScore(req.user.userId);
    res.json({
      proof: proof || null,
      privateData: {
        averageScore: score,
        totalRatings: count,
        thresholds: THRESHOLDS.map(t => ({
          ...t,
          met: score >= t.min,
        })),
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { rateFreelancer, getProof, getMyProof };
