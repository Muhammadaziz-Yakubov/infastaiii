const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { limit = 50, unreadOnly } = req.query;
    
    const query = { userId: req.userId };
    
    if (unreadOnly === 'true') {
      query.status = { $ne: 'read' };
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Get notification count
router.get('/count', async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      status: { $ne: 'read' }
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.userId 
      },
      { 
        status: 'read',
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirishnoma topilmadi'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Mark all as read
router.put('/mark-all-read', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        userId: req.userId,
        status: { $ne: 'read' }
      },
      { 
        status: 'read',
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} ta bildirishnoma o'qildi deb belgilandi`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirishnoma topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Bildirishnoma o\'chirildi'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Clear all notifications
router.delete('/', async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.userId });

    res.json({
      success: true,
      message: `${result.deletedCount} ta bildirishnoma o'chirildi`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

module.exports = router;