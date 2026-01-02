const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'debt_reminder',
      'debt_overdue',
      'payment_due',
      'system',
      'announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'read', 'failed'],
    default: 'scheduled'
  },
  channel: {
    type: String,
    enum: ['in_app', 'email', 'push', 'sms', 'all'],
    default: 'in_app'
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  sentAt: Date,
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for notification queries
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 'scheduled' });

module.exports = mongoose.model('Notification', notificationSchema);