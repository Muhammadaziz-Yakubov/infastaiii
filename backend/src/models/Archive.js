const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['completed', 'archived', 'cancelled'],
    required: true,
    default: 'completed'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deadline: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Goal integration
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  goalProgressImpact: {
    type: Number,
    default: 0
  },
  isGoalGenerated: {
    type: Boolean,
    default: false
  },
  
  // Completion/Archive details
  completedAt: {
    type: Date,
    default: Date.now
  },
  archivedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  
  // Task metadata
  category: {
    type: String,
    default: 'general'
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  }
}, {
  timestamps: true
});

// Indexes for better performance
archiveSchema.index({ userId: 1, completedAt: -1 });
archiveSchema.index({ userId: 1, status: 1 });
archiveSchema.index({ userId: 1, goalId: 1 });

// Virtual for days since completion
archiveSchema.virtual('daysSinceCompletion').get(function() {
  if (!this.completedAt) return 0;
  const now = new Date();
  const diff = now - this.completedAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Archive', archiveSchema);