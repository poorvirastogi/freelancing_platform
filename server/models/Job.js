const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  skills: [String],
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  milestones: [{
    title: { type: String },
    percentage: { type: Number },
    released: { type: Boolean, default: false },
  }],
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled', 'deleted'], default: 'open' },
  hiredFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  escrowAddress: { type: String, default: null },
  paymentProgress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Job', jobSchema);
