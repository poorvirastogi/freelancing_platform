const mongoose = require('mongoose');
const zkProofSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  proofHash: { type: String, required: true },
  threshold: { type: Number, default: 3.5 },
  verified: { type: Boolean, default: false },
  verifiedLevel: { type: String, default: 'None' },
  verifiedEmoji: { type: String, default: '◌' },
  verifiedColor: { type: String, default: '#888' },
  publicStatement: { type: String },
  verifiedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('ZKProof', zkProofSchema);
