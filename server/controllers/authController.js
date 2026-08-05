const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get nonce for wallet
const getNonce = async (req, res) => {
  try {
    const address = req.params.walletAddress.toLowerCase();
    let user = await User.findOne({ walletAddress: address });
    if (!user) {
      // Create new user with no role yet
      user = await User.create({ walletAddress: address });
    }
    res.json({ nonce: user.nonce, isNew: !user.role || user.role === '' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Verify signature — role passed from frontend
const verifySignature = async (req, res) => {
  try {
    const { walletAddress, signature, role } = req.body;
    const address = walletAddress.toLowerCase();

    let user = await User.findOne({ walletAddress: address });
    if (!user) {
      user = await User.create({ walletAddress: address, role: role || 'freelancer' });
    }

    const message = `Welcome to FreeLance3!\n\nPlease sign this message to verify your wallet.\n\nNonce: ${user.nonce}`;
    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== address) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // If role is provided and user has no role yet, set it
    if (role && (!user.role || user.role === '')) {
      user.role = role;
    }

    // If role is provided and matches — allow login
    // If user already has a role and tries wrong portal — block them
    if (role && user.role && user.role !== role) {
      return res.status(403).json({
        error: `This wallet is registered as a ${user.role}. Please use the ${user.role} portal.`,
        correctRole: user.role
      });
    }

    // Rotate nonce
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        email: user.email
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Register with email/password
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: role || 'freelancer' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Login with email/password
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    if (role && user.role !== role) {
      return res.status(403).json({ error: `This account is registered as a ${user.role}. Please use the ${user.role} portal.`, correctRole: user.role });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, walletAddress: user.walletAddress } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { getNonce, verifySignature, register, login };
