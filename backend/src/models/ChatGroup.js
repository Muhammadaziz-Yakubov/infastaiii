const mongoose = require('mongoose');

const chatGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  challengeId: {
    type: String,
    required: true,
    ref: 'Challenge'
  },
  members: [{
    userId: {
      type: String,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    text: {
      type: String,
      default: ''
    },
    senderId: {
      type: String,
      ref: 'User'
    },
    senderName: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  unreadCounts: [{
    userId: {
      type: String,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB
    },
    allowedFileTypes: [{
      type: String
    }],
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
chatGroupSchema.index({ challengeId: 1 });
chatGroupSchema.index({ 'members.userId': 1 });
chatGroupSchema.index({ 'members.isOnline': 1 });
chatGroupSchema.index({ updatedAt: -1 });

// Virtual for member count
chatGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for online member count
chatGroupSchema.virtual('onlineMemberCount').get(function() {
  return this.members.filter(member => member.isOnline).length;
});

// Static methods
chatGroupSchema.statics.getUserGroups = async function(userId) {
  return this.find({ 
    'members.userId': userId,
    isActive: true 
  })
  .populate('members.userId', 'firstName lastName avatar')
  .populate('lastMessage.senderId', 'firstName lastName')
  .sort({ updatedAt: -1 })
  .lean();
};

chatGroupSchema.statics.addMember = async function(groupId, userId, name, role = 'member') {
  return this.updateOne(
    { _id: groupId, 'members.userId': { $ne: userId } },
    { 
      $push: { 
        members: { 
          userId, 
          name, 
          role, 
          joinedAt: new Date() 
        } 
      },
      updatedAt: new Date()
    }
  );
};

chatGroupSchema.statics.removeMember = async function(groupId, userId) {
  return this.updateOne(
    { _id: groupId },
    { 
      $pull: { members: { userId } },
      updatedAt: new Date()
    }
  );
};

chatGroupSchema.statics.updateLastMessage = async function(groupId, message) {
  return this.updateOne(
    { _id: groupId },
    {
      lastMessage: {
        text: message.text,
        senderId: message.senderId,
        senderName: message.senderName,
        timestamp: message.timestamp
      },
      updatedAt: new Date()
    }
  );
};

chatGroupSchema.statics.setMemberOnlineStatus = async function(userId, isOnline) {
  return this.updateMany(
    { 'members.userId': userId },
    { 
      $set: { 
        'members.$.isOnline': isOnline,
        'members.$.lastSeen': new Date()
      }
    }
  );
};

// Instance methods
chatGroupSchema.methods.addMember = async function(userId, name, role = 'member') {
  if (!this.members.some(member => member.userId === userId)) {
    this.members.push({ userId, name, role, joinedAt: new Date() });
    this.updatedAt = new Date();
    return this.save();
  }
  return this;
};

chatGroupSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(member => member.userId !== userId);
  this.updatedAt = new Date();
  return this.save();
};

chatGroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.userId === userId);
};

chatGroupSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(member => member.userId === userId);
  return member ? member.role : null;
};

chatGroupSchema.methods.updateUnreadCount = async function(userId, increment = 1) {
  const unreadCount = this.unreadCounts.find(uc => uc.userId === userId);
  
  if (unreadCount) {
    unreadCount.count += increment;
  } else {
    this.unreadCounts.push({ userId, count: increment });
  }
  
  return this.save();
};

module.exports = mongoose.model('ChatGroup', chatGroupSchema);
