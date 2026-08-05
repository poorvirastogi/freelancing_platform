const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileData: { type: Buffer, required: true },
  fileSize: { type: Number },
  message: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'approved', 'rejected'], default: 'submitted' },
  milestoneIndex: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Submission', submissionSchema);
