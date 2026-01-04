// src/models/User.js - Authentication Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: function() {
      return this.authProvider === 'email' || this.authProvider === 'google';
    },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  // Password - required only for email/phone auth
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'email' || this.authProvider === 'phone';
    }
  },

  // Google OAuth
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },

  // Profile information
  firstName: {
    type: String,
    required: function() {
      return this.authProvider !== 'phone'; // Required for email/google auth
    },
    trim: true,
    default: 'Foydalanuvchi'
  },

  lastName: {
    type: String,
    required: function() {
      return this.authProvider !== 'phone'; // Required for email/google auth
    },
    trim: true,
    default: 'User'
  },

  // Optional fields
  birthday: {
    type: Date
  },

  avatar: {
    type: String,
    default: null
  },

  // Verification status
  emailVerified: {
    type: Boolean,
    default: function() {
      return this.authProvider === 'google'; // Google users are pre-verified
    }
  },

  // Auth provider type
  authProvider: {
    type: String,
    enum: ['email', 'google', 'phone'],
    default: 'email',
    required: true
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },

  // Admin status
  isAdmin: {
    type: Boolean,
    default: false
  },

  // Ban status
  isBanned: {
    type: Boolean,
    default: false
  },

  // Activity tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },

  // Subscription
  subscriptionType: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },

  subscriptionPlan: {
    type: String,
    default: null
  },

  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'inactive'
  },

  subscriptionEndDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Note: email and googleId already have indexes from unique: true
// Additional indexes can be added here if needed for compound queries

// Parolni hash qilish
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Parolni solishtirish
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);