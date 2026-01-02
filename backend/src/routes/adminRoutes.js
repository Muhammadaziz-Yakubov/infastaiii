// src/routes/adminRoutes.js - Admin routes
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Admin login (no authentication required)
router.post('/login', adminController.adminLogin);

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is working!',
    timestamp: new Date().toISOString()
  });
});

// All other admin routes require admin authentication
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.post('/users/:userId/toggle-ban', adminController.toggleUserBan);

// Admin user creation (for setup)
router.post('/create-admin', adminController.createAdminUser);

module.exports = router;
