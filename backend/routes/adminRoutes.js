const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { registerUser } = require('../controllers/authController'); // Reuse logic

router.get('/stats', protect, authorize('admin'), getStats);
router.post('/users', protect, authorize('admin'), registerUser);

module.exports = router;
