const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// All routes need authentication
router.use(protect);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('avatar'), userController.updateProfile);
router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);
router.post('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);

// Dashboard
router.get('/dashboard-stats', userController.getDashboardStats);

module.exports = router;