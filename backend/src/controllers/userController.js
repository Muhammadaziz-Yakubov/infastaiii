const User = require('../models/User');
const Task = require('../models/Task');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Get user stats
    const totalTasks = await Task.countDocuments({ userId: req.userId });
    const completedTasks = await Task.countDocuments({ 
      userId: req.userId, 
      status: 'completed' 
    });
    const pendingTasks = await Task.countDocuments({ 
      userId: req.userId, 
      status: 'pending' 
    });
    const inProgressTasks = await Task.countDocuments({ 
      userId: req.userId, 
      status: 'in_progress' 
    });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Handle both JSON and FormData
    let updateData = {};

    if (req.file) {
      // FormData with file upload
      updateData = { ...req.body };
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    } else {
      // Regular JSON data
      updateData = req.body;
    }

    // Update text fields
    if (updateData.firstName !== undefined) user.firstName = updateData.firstName.trim();
    if (updateData.lastName !== undefined) user.lastName = updateData.lastName.trim();
    if (updateData.birthday !== undefined) user.birthday = updateData.birthday ? new Date(updateData.birthday) : undefined;
    if (updateData.phone !== undefined) user.phone = updateData.phone;

    // Handle avatar upload if file is provided
    if (updateData.avatar) {
      user.avatar = updateData.avatar;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Profil yangilandi',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        subscriptionType: user.subscriptionType
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Rasm fayli yuborilmadi'
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Save avatar URL (in production, upload to cloud storage like AWS S3, Cloudinary, etc.)
    // For now, we'll use base64 or save file path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    user.avatar = avatarUrl;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Rasm muvaffaqiyatli yuklandi',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Rasm yuklashda xatolik'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Barcha maydonlarni to\'ldiring'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak'
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Joriy parol noto\'g\'ri'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Parol muvaffaqiyatli o\'zgartirildi'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Parolni kiriting'
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Parol noto\'g\'ri'
      });
    }

    // Delete user's tasks
    await Task.deleteMany({ userId: req.userId });

    // Delete user
    await User.findByIdAndDelete(req.userId);

    res.json({
      success: true,
      message: 'Akkount o\'chirildi'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Total tasks
    const totalTasks = await Task.countDocuments({ userId });

    // Completed tasks
    const completedTasks = await Task.countDocuments({ 
      userId, 
      status: 'completed' 
    });

    // Pending tasks
    const pendingTasks = await Task.countDocuments({ 
      userId, 
      status: 'pending' 
    });

    // In progress tasks
    const inProgressTasks = await Task.countDocuments({ 
      userId, 
      status: 'in_progress' 
    });

    // Today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = await Task.countDocuments({
      userId,
      deadline: { $gte: today, $lt: tomorrow }
    });

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      userId,
      status: { $ne: 'completed' },
      deadline: { $lt: today }
    });

    // This week completion
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const thisWeekCompleted = await Task.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: weekStart }
    });

    const thisWeekTotal = await Task.countDocuments({
      userId,
      createdAt: { $gte: weekStart }
    });

    // Recent tasks (last 5)
    const recentTasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status priority deadline');

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        todayTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        weeklyCompletion: thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0
      },
      recentTasks
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};