// src/models/Challenge.js
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  // Challenge ID (INF-CH-XXXX format)
  challengeId: {
    type: String,
    unique: true
  },
  
  // Creator
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Challenge Type
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special'],
    default: 'daily'
  },
  
  // Category
  category: {
    type: String,
    enum: ['sport', 'reading', 'water', 'meditation', 'language', 'finance', 'health', 'custom'],
    default: 'custom'
  },
  
  // Duration
  duration: {
    type: Number,
    enum: [7, 14, 30],
    default: 30
  },
  
  // Daily Goal
  dailyGoal: {
    value: {
      type: Number,
      required: true,
      default: 1
    },
    unit: {
      type: String,
      enum: ['minutes', 'times', 'pages', 'liters', 'steps', 'custom'],
      default: 'times'
    },
    customUnit: {
      type: String,
      maxlength: 20
    }
  },
  
  // Tracking Type
  trackingType: {
    type: String,
    enum: ['manual', 'timer', 'quantity', 'photo'],
    default: 'manual'
  },
  
  // Participants
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  
  currentParticipants: {
    type: Number,
    default: 1
  },
  
  // Visibility
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Invite Code (48 soat amal qiladi)
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  inviteCodeExpiry: {
    type: Date
  },
  
  // Icon/Color
  icon: {
    type: String,
    default: '🎯'
  },
  
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

// Generate unique challenge ID
challengeSchema.pre('save', async function(next) {
  if (!this.challengeId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.challengeId = `INF-CH-${randomNum}`;
  }
  
  // Calculate end date
  if (this.startDate && this.duration && !this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.duration);
    this.endDate = endDate;
  }
  
  next();
});

// Indexes
challengeSchema.index({ creatorId: 1, status: 1 });
challengeSchema.index({ challengeId: 1 });
challengeSchema.index({ inviteCode: 1 });
challengeSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
