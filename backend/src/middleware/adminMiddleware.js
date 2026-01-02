// src/middleware/adminMiddleware.js - Admin access control middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Yaroqsiz token'
      });
    }

    // Find user and check if admin
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin huquqi talab qilinadi'
      });
    }

    // Add user to request object
    req.user = user;
    req.admin = user;
    next();

  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Avtorizatsiya xatosi'
    });
  }
};

// Middleware to check if user is banned
const checkBanStatus = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(); // No token, continue (might be public route)
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

      if (decoded.userId) {
        const user = await User.findById(decoded.userId);

        if (user && user.isBanned) {
          return res.status(403).json({
            success: false,
            message: 'Siz bloklandingiz. Admin bilan bog\'laning.'
          });
        }

        // Add user to request if not banned
        if (user) {
          req.user = user;
        }
      }
    } catch (tokenError) {
      // Invalid token, continue without user
      console.log('Invalid token in ban check:', tokenError.message);
    }

    next();

  } catch (error) {
    console.error('Ban check middleware error:', error);
    next(); // Continue on error to avoid blocking legitimate requests
  }
};

module.exports = {
  requireAdmin,
  checkBanStatus
};
