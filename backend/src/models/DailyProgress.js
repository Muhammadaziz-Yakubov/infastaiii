// src/models/DailyProgress.js
const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
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
  
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChallengeParticipant',
    required: true
  },
  
  // Day number (1-30)
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  
  // Date
  date: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'done', 'missed', 'skipped'],
    default: 'pending'
  },
  
  // Progress value (for quantity-based tracking)
  progressValue: {
    type: Number,
    default: 0
  },
  
  // Goal value for this day
  goalValue: {
    type: Number,
    required: true
  },
  
  // Time spent (for timer-based tracking)
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  
  // Photo proof URL
  proofUrl: {
    type: String
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: 200
  },
  
  // Completed at
  completedAt: {
    type: Date
  },
  
  // Points earned for this day
  pointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Unique constraint - bir user bir challenge'da bir kun uchun faqat bitta progress
dailyProgressSchema.index({ userId: 1, challengeId: 1, dayNumber: 1 }, { unique: true });
dailyProgressSchema.index({ challengeId: 1, date: 1 });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
