const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// One rating per job
ratingSchema.index({ job: 1, client: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
