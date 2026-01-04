const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['borrow', 'lend'],
    required: true,
    description: 'borrow - olingan qarz, lend - berilgan qarz'
  },
  personName: {
    type: String,
    required: true,
    trim: true,
    description: 'Qarz bergan/olgan shaxs nomi'
  },
  personPhone: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue'],
    default: 'active'
  },
  dueDate: {
    type: Date,
    required: true
  },
  originalDueDate: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly']
  },
  nextPaymentDate: Date,
  paymentHistory: [{
    amount: Number,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  notifications: {
    beforeDue: {
      enabled: {
        type: Boolean,
        default: true
      },
      daysBefore: {
        type: Number,
        default: 3
      },
      lastSent: Date
    },
    onDue: {
      enabled: {
        type: Boolean,
        default: true
      },
      lastSent: Date
    },
    overdue: {
      enabled: {
        type: Boolean,
        default: true
      },
      daysInterval: {
        type: Number,
        default: 1
      },
      lastSent: Date
    }
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
debtSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Agar yangi qarz bo'lsa, remainingAmount ni amount ga tenglashtirish
  if (this.isNew) {
    this.remainingAmount = this.amount;
    this.originalDueDate = this.dueDate;
  }
  
  // Statusni avtomatik yangilash
  if (this.remainingAmount <= 0) {
    this.status = 'completed';
  } else if (this.dueDate < new Date()) {
    this.status = 'overdue';
  } else {
    this.status = 'active';
  }
  
  next();
});

// Indexes for efficient queries
debtSchema.index({ userId: 1, status: 1 });
debtSchema.index({ userId: 1, dueDate: 1 });
debtSchema.index({ userId: 1, type: 1 });
debtSchema.index({ dueDate: 1, status: 'active' }); // For notification queries

// Statik metodlar
debtSchema.statics.getUserDebtSummary = async function(userId) {
  const debts = await this.find({ userId });
  
  let totalBorrowed = 0;
  let totalLent = 0;
  let activeBorrowed = 0;
  let activeLent = 0;
  let overdueBorrowed = 0;
  let overdueLent = 0;
  
  debts.forEach(debt => {
    if (debt.type === 'borrow') {
      totalBorrowed += debt.amount;
      activeBorrowed += debt.remainingAmount;
      if (debt.status === 'overdue') overdueBorrowed += debt.remainingAmount;
    } else {
      totalLent += debt.amount;
      activeLent += debt.remainingAmount;
      if (debt.status === 'overdue') overdueLent += debt.remainingAmount;
    }
  });
  
  return {
    totalBorrowed,
    totalLent,
    activeBorrowed,
    activeLent,
    overdueBorrowed,
    overdueLent,
    netDebt: activeBorrowed - activeLent
  };
};

module.exports = mongoose.model('Debt', debtSchema);