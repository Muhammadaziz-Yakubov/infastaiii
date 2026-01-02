// src/controllers/adminController.js - Admin dashboard and user management
const User = require('../models/User');
const Task = require('../models/Task'); // Assuming Task model exists
const Payment = require('../models/Payment'); // Assuming Payment model exists
const jwt = require('jsonwebtoken');

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

    // Count payments/transactions (if Payment model exists)
    let totalPayments = 0;
    let totalRevenue = 0;
    try {
      totalPayments = await Payment.countDocuments();
      const payments = await Payment.find({ status: 'approved' });
      totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    } catch (error) {
      console.log('Payment model not available, skipping payment stats');
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
        totalPayments,
        totalRevenue,
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
      taskCount = await Task.countDocuments({ userId });
    } catch (error) {
      console.log('Task model not available');
    }

    // Get user's payments count (if Payment model exists)
    let paymentCount = 0;
    try {
      paymentCount = await Payment.countDocuments({ userId });
    } catch (error) {
      console.log('Payment model not available');
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
