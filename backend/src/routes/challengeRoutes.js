// src/routes/challengeRoutes.js
const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all challenges for user
router.get('/', challengeController.getChallenges);

// Create new challenge
router.post('/', challengeController.createChallenge);

// Join challenge by invite code
router.post('/join', challengeController.joinChallenge);

// Get challenge details
router.get('/:id', challengeController.getChallengeDetails);

// Update daily progress
router.put('/:id/progress', challengeController.updateProgress);

// Generate new invite code
router.post('/:id/invite', challengeController.generateInviteCode);

// Get leaderboard
router.get('/:id/leaderboard', challengeController.getLeaderboard);

// Leave challenge
router.post('/:id/leave', challengeController.leaveChallenge);

// Delete challenge
router.delete('/:id', challengeController.deleteChallenge);

module.exports = router;
