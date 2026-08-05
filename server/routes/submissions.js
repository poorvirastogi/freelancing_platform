const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { submitWork, getSubmissions, downloadFile } = require('../controllers/submissionController');
router.post('/:jobId', protect, upload.single('file'), submitWork);
router.get('/:jobId', protect, getSubmissions);
router.get('/download/:id', protect, downloadFile);
module.exports = router;
