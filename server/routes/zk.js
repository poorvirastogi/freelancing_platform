const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { rateFreelancer, getProof, getMyProof } = require('../controllers/zkController');

router.post('/rate', protect, rateFreelancer);
router.get('/proof/:freelancerId', getProof);
router.get('/my-proof', protect, getMyProof);

module.exports = router;
