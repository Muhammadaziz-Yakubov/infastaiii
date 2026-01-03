// Public API endpoints - no authentication required
const User = require('../models/User');
const Task = require('../models/Task');
const Goal = require('../models/Goal');

// Get public statistics for landing page
exports.getPublicStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments({ isBanned: false });

    // Count total tasks
    let totalTasks = 0;
    let completedTasks = 0;
    try {
      totalTasks = await Task.countDocuments();
      completedTasks = await Task.countDocuments({ status: 'completed' });
    } catch (error) {
      console.log('Task model error:', error.message);
    }

    // Count total goals
    let totalGoals = 0;
    let completedGoals = 0;
    try {
      totalGoals = await Goal.countDocuments();
      completedGoals = await Goal.countDocuments({ status: 'completed' });
    } catch (error) {
      console.log('Goal model error:', error.message);
    }

    // Calculate average rating (mock for now, can be real if you have reviews)
    const averageRating = 4.9;

    // Response
    res.json({
      success: true,
      stats: {
        totalUsers,
        completedTasks,
        completedGoals,
        averageRating,
        // Additional stats
        activeUsers: Math.floor(totalUsers * 0.85), // 85% active users
        totalTasks,
        totalGoals
      }
    });

  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Statistika yuklanmadi',
      stats: {
        totalUsers: 0,
        completedTasks: 0,
        completedGoals: 0,
        averageRating: 4.9
      }
    });
  }
};

module.exports = exports;
