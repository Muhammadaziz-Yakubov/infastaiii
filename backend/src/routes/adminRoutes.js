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
router.put('/users/:userId/profile', adminController.updateUserProfile);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/users/:userId/notifications', adminController.getUserNotifications);

// Notifications
router.post('/notifications/send', adminController.sendNotification);

// Admin user creation (for setup)
router.post('/create-admin', adminController.createAdminUser);

// Data views - Tasks, Challenges, Goals, Transactions
router.get('/tasks', adminController.getAllTasks);
router.get('/challenges', adminController.getAllChallenges);
router.get('/goals', adminController.getAllGoals);
router.get('/transactions', adminController.getAllTransactions);

// Delete operations
router.delete('/tasks/:taskId', adminController.deleteTask);
router.delete('/challenges/:challengeId', adminController.deleteChallenge);
router.delete('/goals/:goalId', adminController.deleteGoal);
router.delete('/transactions/:transactionId', adminController.deleteTransaction);

module.exports = router;

