const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['Pro', 'Family', 'Enterprise']
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly']
  },
  amount: {
    type: Number,
    required: true
  },
  receiptUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  telegramMessageId: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedReason: {
    type: String
  },
  subscriptionEndDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-calculate subscription end date
paymentSchema.pre('save', function(next) {
  if (this.status === 'approved' && !this.subscriptionEndDate) {
    const now = new Date();
    if (this.billingCycle === 'yearly') {
      this.subscriptionEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      this.subscriptionEndDate = new Date(now.setMonth(now.getMonth() + 1));
    }
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
