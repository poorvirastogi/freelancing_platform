const mongoose = require('mongoose');

const skillVerificationSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'passed', 'failed'],
    default: 'pending'
  },
  challenge: { type: String },        // The question asked
  submittedAnswer: { type: String },  // What freelancer submitted
  aiFeedback: { type: String },       // AI's evaluation feedback
  attemptCount: { type: Number, default: 0 },
  verifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// One verification per skill per freelancer
skillVerificationSchema.index({ freelancer: 1, skill: 1 }, { unique: true });

module.exports = mongoose.model('SkillVerification', skillVerificationSchema);
