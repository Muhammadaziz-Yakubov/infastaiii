const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  icon: {
    type: String,
    default: 'Target'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['personal', 'family', 'education', 'travel', 'vehicle', 'technology', 'health', 'business', 'other'],
    default: 'personal'
  },
  autoSave: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['monthly', 'percentage'], default: 'monthly' },
    amount: { type: Number, default: 0 },
    percentage: { type: Number, default: 10, min: 0, max: 100 },
    nextDate: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Progress virtual field
goalSchema.virtual('progress').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 1000) / 10);
});

// Days remaining virtual field
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const due = new Date(this.deadline);
  const diff = due - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
});

// Update updatedAt on save
goalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Goal', goalSchema);