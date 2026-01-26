const express = require('express');
const router = express.Router();
const familyController = require('../controllers/FamilyController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.post('/create', familyController.createFamily);
router.post('/join', familyController.joinFamily);
router.get('/details', familyController.getFamily);
router.get('/dashboard', familyController.getFamilyDashboard);
router.post('/tasks/assign', familyController.assignTask);
router.post('/goals/add', familyController.addGoal);
router.post('/goals/update-progress', familyController.updateGoalProgress);

module.exports = router;
