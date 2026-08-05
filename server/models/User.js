const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, sparse: true, lowercase: true },
  nonce: { type: String, default: () => Math.floor(Math.random() * 1000000).toString() },
  username: { type: String, default: '' },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  password: { type: String, default: null },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['client', 'freelancer'], default: '' },
  skills: [String],
  createdAt: { type: Date, default: Date.now },
});
userSchema.methods.matchPassword = async function(p) {
  return await bcrypt.compare(p, this.password);
};
module.exports = mongoose.model('User', userSchema);
