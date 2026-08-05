const express = require('express');
const router = express.Router();
const { getNonce, verifySignature } = require('../controllers/authController');

// GET /api/auth/nonce/:walletAddress
router.get('/nonce/:walletAddress', getNonce);

// POST /api/auth/verify
router.post('/verify', verifySignature);

module.exports = router;