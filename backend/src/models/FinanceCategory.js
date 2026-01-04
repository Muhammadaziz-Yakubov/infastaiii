// backend/src/models/FinanceCategory.js
const mongoose = require('mongoose');

const financeCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  icon: {
    type: String,
    default: 'DollarSign'
  },
  color: {
    type: String,
    default: '#FF6B35'
  },
  budget: {
    type: Number,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index
financeCategorySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('FinanceCategory', financeCategorySchema);