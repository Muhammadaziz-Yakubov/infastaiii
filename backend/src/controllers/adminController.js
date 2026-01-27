// src/controllers/adminController.js - Admin dashboard and user management
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// JWT Token Generation
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { expiresIn: '30d' }
  );
};

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Count active users (not banned)
    const activeUsers = await User.countDocuments({
      isActive: true,
      isBanned: false
    });

    // Count banned users
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Count admin users
    const adminUsers = await User.countDocuments({ isAdmin: true });

    // Count tasks (if Task model exists)
    let totalTasks = 0;
    try {
      totalTasks = await Task.countDocuments();
    } catch (error) {
      console.log('Task model not available, skipping task count');
    }

    // Recent users (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName phone email avatar createdAt isBanned isAdmin')
      .lean();

    // User growth statistics - last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Daily user registrations for last 30 days
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Format user growth data
    const userGrowthData = userGrowth.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count
    }));

    // User activity by hour (when users login most)
    const loginActivity = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $hour: '$lastLogin' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Format login activity data (24 hours)
    const loginActivityData = Array.from({ length: 24 }, (_, hour) => {
      const found = loginActivity.find(item => item._id === hour);
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        count: found ? found.count : 0
      };
    });

    // Weekly comparison
    const lastWeekUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekUsers = await User.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lt: sevenDaysAgo }
    });

    const weeklyGrowthPercent = previousWeekUsers > 0
      ? Math.round(((lastWeekUsers - previousWeekUsers) / previousWeekUsers) * 100)
      : lastWeekUsers > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        bannedUsers,
        adminUsers,
        totalTasks,
        recentUsers,
        userGrowthData,
        loginActivityData,
        lastWeekUsers,
        weeklyGrowthPercent
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Statistika yuklanmadi'
    });
  }
};

// Get all users with pagination and filtering
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status; // 'active', 'banned', 'admin'

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'admin') {
      query.isAdmin = true;
    } else if (status === 'active') {
      query.isActive = true;
      query.isBanned = false;
    }

    // Get users with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('firstName lastName phone email avatar createdAt isBanned isAdmin isActive subscriptionType lastLogin')
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Foydalanuvchilar yuklanmadi'
    });
  }
};

// Ban or unban a user
exports.toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ban } = req.body; // boolean: true to ban, false to unban

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Foydalanuvchi ID talab qilinadi'
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Prevent banning other admins
    if (user.isAdmin && req.admin._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Boshqa adminlarni bloklash mumkin emas'
      });
    }

    // Update ban status
    user.isBanned = ban;
    await user.save();

    res.json({
      success: true,
      message: ban ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi',
      data: {
        userId: user._id,
        isBanned: user.isBanned
      }
    });

  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({
      success: false,
      message: 'Amaliyot bajarilmadi'
    });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password') // Exclude password
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Get user's tasks count (if Task model exists)
    let taskCount = 0;
    try {
      taskCount = await Task.countDocuments({ userId: userId });
    } catch (error) {
      console.log('Task model not available:', error.message);
    }

    // Get user's payments count (if Payment model exists)
    let paymentCount = 0;
    try {
      paymentCount = await Payment.countDocuments({ userId: userId });
    } catch (error) {
      console.log('Payment model not available:', error.message);
    }

    res.json({
      success: true,
      data: {
        ...user,
        taskCount,
        paymentCount
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Foydalanuvchi ma\'lumotlari yuklanmadi'
    });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login va parol kiritilishi shart'
      });
    }

    // Check if the credentials match the admin user
    // Login: Muhammadaziz, Parol: Azizbek0717
    if (username !== 'Muhammadaziz' || password !== 'Azizbek0717') {
      return res.status(401).json({
        success: false,
        message: 'Noto\'g\'ri login yoki parol'
      });
    }

    // Find or create the admin user
    let adminUser = await User.findOne({
      isAdmin: true,
      firstName: 'Muhammadaziz'
    });

    if (!adminUser) {
      // Create admin user if doesn't exist
      adminUser = new User({
        email: 'admin@infastai.uz',
        password: 'Azizbek0717',
        firstName: 'Muhammadaziz',
        lastName: 'Admin',
        authProvider: 'email',
        isAdmin: true,
        isActive: true,
        isBanned: false,
        emailVerified: true,
        subscriptionType: 'enterprise'
      });
      await adminUser.save();
    }

    // Generate token
    const token = generateToken({ userId: adminUser._id });

    res.json({
      success: true,
      message: 'Admin panelga xush kelibsiz!',
      token,
      user: {
        id: adminUser._id,
        phone: adminUser.phone,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isAdmin: adminUser.isAdmin,
        subscriptionType: adminUser.subscriptionType
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Kirishda xatolik'
    });
  }
};

// Create admin user (one-time setup)
exports.createAdminUser = async (req, res) => {
  try {
    const { phone, password, firstName, lastName } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ phone, isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Bu telefon raqam bilan admin allaqachon mavjud'
      });
    }

    // Create admin user
    const adminUser = new User({
      phone,
      password,
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      authProvider: 'phone',
      isAdmin: true,
      isActive: true,
      isBanned: false,
      emailVerified: true
    });

    await adminUser.save();

    res.json({
      success: true,
      message: 'Admin foydalanuvchi yaratildi',
      data: {
        id: adminUser._id,
        phone: adminUser.phone,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin yaratishda xatolik'
    });
  }
};

// Send notification to all users or specific user
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Sarlavha va xabar majburiy'
      });
    }

    let targetUsers = [];

    if (userId) {
      // Send to specific user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Foydalanuvchi topilmadi'
        });
      }
      targetUsers = [user];
    } else {
      // Send to all active users
      targetUsers = await User.find({ isBanned: false, isActive: true });
    }

    const notifications = [];
    for (const user of targetUsers) {
      const notification = new Notification({
        userId: user._id,
        type: type || 'announcement',
        title,
        message,
        priority: 'medium',
        status: 'sent',
        channel: 'in_app',
        scheduledFor: new Date(),
        sentAt: new Date()
      });
      await notification.save();
      notifications.push(notification);
    }

    console.log(`✅ Notification sent to ${notifications.length} users`);

    res.json({
      success: true,
      message: `${notifications.length} ta foydalanuvchiga xabar yuborildi`,
      count: notifications.length
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Xabar yuborishda xatolik'
    });
  }
};

// Update user profile (admin)
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    console.log(`✅ User ${userId} profile updated by admin`);

    res.json({
      success: true,
      message: 'Foydalanuvchi profili yangilandi',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profilni yangilashda xatolik'
    });
  }
};

// Delete user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin foydalanuvchini o\'chirish mumkin emas'
      });
    }

    // Delete user's notifications
    await Notification.deleteMany({ userId: user._id });

    // Delete user's tasks
    await Task.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(userId);

    console.log(`✅ User ${userId} deleted by admin`);

    res.json({
      success: true,
      message: 'Foydalanuvchi o\'chirildi'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Foydalanuvchini o\'chirishda xatolik'
    });
  }
};

// Get user notifications (for admin to see)
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Xabarlarni yuklashda xatolik'
    });
  }
};

// Get all tasks (admin)
exports.getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Vazifalarni yuklashda xatolik'
    });
  }
};

// Get all challenges (admin)
exports.getAllChallenges = async (req, res) => {
  try {
    const Challenge = require('../models/Challenge');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { challengeId: { $regex: search, $options: 'i' } }
      ];
    }

    const challenges = await Challenge.find(query)
      .populate('creatorId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Challenge.countDocuments(query);

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengelarni yuklashda xatolik'
    });
  }
};

// Get all goals (admin)
exports.getAllGoals = async (req, res) => {
  try {
    const Goal = require('../models/Goal');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const goals = await Goal.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Goal.countDocuments(query);

    res.json({
      success: true,
      data: {
        goals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Maqsadlarni yuklashda xatolik'
    });
  }
};

// Get all finance transactions (admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const Finance = require('../models/Finance');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const type = req.query.type; // 'income' or 'expense'

    let query = {};
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) {
      query.type = type;
    }

    const transactions = await Finance.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Finance.countDocuments(query);

    // Calculate totals
    const totalIncome = await Finance.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpense = await Finance.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalIncome: totalIncome[0]?.total || 0,
          totalExpense: totalExpense[0]?.total || 0,
          balance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Tranziukatsiyalarni yuklashda xatolik'
    });
  }
};

// Delete task (admin)
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Task o\'chirildi'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Taskni o\'chirishda xatolik'
    });
  }
};

// Delete challenge (admin)
exports.deleteChallenge = async (req, res) => {
  try {
    const Challenge = require('../models/Challenge');
    const { challengeId } = req.params;
    const challenge = await Challenge.findByIdAndDelete(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Challenge o\'chirildi'
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Challengeni o\'chirishda xatolik'
    });
  }
};

// Delete goal (admin)
exports.deleteGoal = async (req, res) => {
  try {
    const Goal = require('../models/Goal');
    const { goalId } = req.params;
    const goal = await Goal.findByIdAndDelete(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Maqsad topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Maqsad o\'chirildi'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Maqsadni o\'chirishda xatolik'
    });
  }
};

// Delete transaction (admin)
exports.deleteTransaction = async (req, res) => {
  try {
    const Finance = require('../models/Finance');
    const { transactionId } = req.params;
    const transaction = await Finance.findByIdAndDelete(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Tranziukatsiya topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Tranziukatsiya o\'chirildi'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Tranziukatsiyani o\'chirishda xatolik'
    });
  }
};

// Bulk delete transactions (admin)
exports.bulkDeleteTransactions = async (req, res) => {
  try {
    const Finance = require('../models/Finance');
    const { transactionIds } = req.body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tranziukatsiya ID lari majburiy'
      });
    }

    const result = await Finance.deleteMany({
      _id: { $in: transactionIds }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} ta tranzaksiya o'chirildi`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Ommaviy o\'chirishda xatolik'
    });
  }
};

// Clear all transactions (admin)
exports.clearAllTransactions = async (req, res) => {
  try {
    console.log('🧹 Starting clear all transactions operation...');
    
    // Check if Finance model exists
    let Finance;
    try {
      Finance = require('../models/Finance');
      console.log('✅ Finance model loaded successfully');
    } catch (modelError) {
      console.error('❌ Error loading Finance model:', modelError);
      return res.status(500).json({
        success: false,
        message: 'Finance modeli yuklanmadi',
        error: modelError.message
      });
    }
    
    // Count documents before deletion
    const countBefore = await Finance.countDocuments();
    console.log(`📊 Found ${countBefore} transactions to delete`);
    
    if (countBefore === 0) {
      return res.json({
        success: true,
        message: 'O\'chirish uchun tranzaksiyalar topilmadi',
        deletedCount: 0
      });
    }
    
    // Perform deletion
    const result = await Finance.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} transactions`);

    res.json({
      success: true,
      message: `Barcha ${result.deletedCount} ta tranzaksiya o'chirildi`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Clear all transactions error:', error);
    console.error('Error stack:', error.stack);
    
    // Send detailed error response
    res.status(500).json({
      success: false,
      message: 'Barcha tranzaksiyalarni o\'chirishda xatolik',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

