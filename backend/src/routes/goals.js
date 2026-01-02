const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// GET /api/goals - Get all goals
router.get('/', goalController.getGoals);

// GET /api/goals/statistics - Get goal statistics
router.get('/statistics', async (req, res) => {
  try {
    const goals = await require('../models/Goal').find({ userId: req.userId });
    
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      totalTarget: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
      totalSaved: goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
      totalProgress: goals.length > 0 
        ? goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / goals.length 
        : 0
    };
    
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Get goals statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// POST /api/goals - Create new goal
router.post('/', goalController.createGoal);

// PUT /api/goals/:id - Update goal
router.put('/:id', goalController.updateGoal);

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', goalController.deleteGoal);

// POST /api/goals/:id/fund - Fund goal
router.post('/:id/fund', goalController.fundGoal);

// PATCH /api/goals/:id/status - Update goal status
router.patch('/:id/status', goalController.updateGoalStatus);

// POST /api/goals/:id/auto-save - Auto-save setup (temporary)
router.post('/:id/auto-save', (req, res) => {
  res.json({
    success: true,
    message: 'Auto-save feature will be implemented soon'
  });
});

module.exports = router;