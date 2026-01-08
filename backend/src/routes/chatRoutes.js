const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user's chat groups
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mongoose = require('mongoose');
    const Challenge = require('../models/Challenge');
    const ChatGroup = require('../models/ChatGroup');

    // Get user's challenges and their chat groups
    const userChallenges = await Challenge.find({
      'participants.userId': userId,
      status: { $in: ['active', 'pending'] } // Use status instead of isActive
    });

    const challengeIds = userChallenges.map(c => c._id.toString());

    const groups = await ChatGroup.find({
      challengeId: { $in: challengeIds }, // challengeId is stored as string
      'members.userId': userId,
      isActive: true
    })
      .populate('members.userId', 'firstName lastName avatar')
      .populate('lastMessage.senderId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, groups });
  } catch (error) {
    console.error('Get chat groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get messages for a specific group
router.get('/messages/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    const ChatMessage = require('../models/ChatMessage');
    const ChatGroup = require('../models/ChatGroup');

    // Check if user is member of the group
    const group = await ChatGroup.findOne({
      _id: groupId,
      'members.userId': userId,
      isActive: true
    });

    if (!group) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    // Get messages for the group
    const messages = await ChatMessage.getGroupMessages(groupId, 50, 0);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send message (fallback for non-WebSocket)
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { groupId, text } = req.body;
    const userId = req.user.userId;
    const ChatMessage = require('../models/ChatMessage');
    const ChatGroup = require('../models/ChatGroup');

    // Check if user is member of the group
    const group = await ChatGroup.findOne({
      _id: groupId,
      'members.userId': userId,
      isActive: true
    });

    if (!group) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    // Create and save message
    const message = new ChatMessage({
      groupId,
      senderId: userId,
      senderName: req.user.firstName || 'Siz',
      text,
      timestamp: new Date()
    });

    await message.save();

    // Update group's last message
    await ChatGroup.updateLastMessage(groupId, {
      text: message.text,
      senderId: userId,
      senderName: req.user.firstName || 'Siz',
      timestamp: message.timestamp
    });

    res.json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get group members
router.get('/members/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const ChatGroup = require('../models/ChatGroup');

    const group = await ChatGroup.findOne({
      _id: groupId,
      'members.userId': req.user.userId,
      isActive: true
    }).populate('members.userId', 'firstName lastName avatar');

    if (!group) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    res.json({ success: true, members: group.members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete message endpoint
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;
    const ChatMessage = require('../models/ChatMessage');

    const message = await ChatMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Xabar topilmadi' });
    }

    // Only sender can delete their own message
    if (message.senderId !== userId) {
      return res.status(403).json({ success: false, message: 'Faqat o\'z xabaringizni o\'chira olasiz' });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ success: true, message: 'Xabar o\'chirildi' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload file endpoint
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/chat');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllarini yuklash mumkin!'));
    }
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fayl topilmadi' });
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: 'Fayl yuklashda xatolik' });
  }
});

module.exports = router;
