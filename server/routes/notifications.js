const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
router.get('/', protect, async (req, res) => {
  try {
    const n = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(n);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.userId, read: false }, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
