const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requestChallenge, submitAnswer, getVerifiedSkills, getMySkills } = require('../controllers/skillController');

router.post('/challenge', protect, requestChallenge);
router.post('/submit', protect, submitAnswer);
router.get('/verified/:freelancerId', getVerifiedSkills);
router.get('/my', protect, getMySkills);

module.exports = router;
