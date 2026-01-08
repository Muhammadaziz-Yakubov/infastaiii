const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    ref: 'Challenge'
  },
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  readBy: [{
    userId: {
      type: String,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
chatMessageSchema.index({ groupId: 1, timestamp: -1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ timestamp: -1 });

// Virtual for formatted time
chatMessageSchema.virtual('formattedTime').get(function () {
  return this.timestamp.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for formatted date
chatMessageSchema.virtual('formattedDate').get(function () {
  return this.timestamp.toLocaleDateString('uz-UZ', {
    month: 'short',
    day: 'numeric'
  });
});

// Static methods
chatMessageSchema.statics.getGroupMessages = async function (groupId, limit = 50, offset = 0) {
  return this.find({
    groupId,
    isDeleted: false
  })
    .sort({ timestamp: 1 }) // Sort ascending (oldest first) for chat display
    .limit(limit)
    .skip(offset)
    .populate('senderId', 'firstName lastName avatar')
    .lean();
};

chatMessageSchema.statics.markAsRead = async function (messageId, userId) {
  return this.updateOne(
    { _id: messageId, 'readBy.userId': { $ne: userId } },
    { $push: { readBy: { userId, readAt: new Date() } } }
  );
};

// Instance methods
chatMessageSchema.methods.edit = async function (newText) {
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

chatMessageSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
