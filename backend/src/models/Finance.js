// backend/src/models/Finance.js
const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    index: true,
    default: null
  },
  isFamilyExpense: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  categoryIcon: {
    type: String,
    default: 'MoreHorizontal'
  },
  categoryColor: {
    type: String,
    default: '#64748b'
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank', 'other'],
    default: 'cash'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before save
financeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
financeSchema.index({ userId: 1, date: -1 });
financeSchema.index({ userId: 1, type: 1 });
financeSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Finance', financeSchema);