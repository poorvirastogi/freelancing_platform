const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['bid_received','hired','payment_released','work_submitted','bid_rejected','job_deleted'], default: 'bid_received' },
  read: { type: Boolean, default: false },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Notification', notificationSchema);
