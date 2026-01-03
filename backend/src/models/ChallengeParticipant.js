// src/models/ChallengeParticipant.js
const mongoose = require('mongoose');

const challengeParticipantSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
    index: true
  },
  
  // Role
  role: {
    type: String,
    enum: ['owner', 'participant'],
    default: 'participant'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'left'],
    default: 'active'
  },
  
  // Progress Stats
  completedDays: {
    type: Number,
    default: 0
  },
  
  missedDays: {
    type: Number,
    default: 0
  },
  
  skippedDays: {
    type: Number,
    default: 0
  },
  
  // Streak
  currentStreak: {
    type: Number,
    default: 0
  },
  
  maxStreak: {
    type: Number,
    default: 0
  },
  
  lastCompletedDate: {
    type: Date
  },
  
  // Points & Score
  totalPoints: {
    type: Number,
    default: 0
  },
  
  // Badges earned
  badges: [{
    type: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'legendary']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Completion percentage
  completionRate: {
    type: Number,
    default: 0
  },
  
  // Joined date
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Unique constraint - bir user bir challenge'ga faqat bir marta qo'shilishi mumkin
challengeParticipantSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

// Calculate completion rate before save
challengeParticipantSchema.pre('save', function(next) {
  const totalDays = this.completedDays + this.missedDays + this.skippedDays;
  if (totalDays > 0) {
    this.completionRate = Math.round((this.completedDays / totalDays) * 100);
  }
  next();
});

module.exports = mongoose.model('ChallengeParticipant', challengeParticipantSchema);
