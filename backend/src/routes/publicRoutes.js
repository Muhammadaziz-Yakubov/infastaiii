// Public routes - no authentication required
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Get public statistics for landing page
router.get('/stats', publicController.getPublicStats);

module.exports = router;
