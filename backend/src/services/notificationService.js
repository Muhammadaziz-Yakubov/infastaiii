// backend/src/services/notificationService.js
const Debt = require('../models/Debt');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
  }

  // Start notification service
  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔔 Notification service started');
    
    // Check every 5 minutes
    this.interval = setInterval(() => {
      this.checkDebtNotifications();
    }, 5 * 60 * 1000);
    
    // Initial check
    setTimeout(() => this.checkDebtNotifications(), 1000);
  }

  // Stop notification service
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.isRunning = false;
      console.log('🔔 Notification service stopped');
    }
  }

  // Check and send debt notifications
  async checkDebtNotifications() {
    try {
      const now = new Date();
      
      // Find active debts
      const activeDebts = await Debt.find({
        status: { $in: ['active', 'overdue'] },
        remainingAmount: { $gt: 0 }
      });

      for (const debt of activeDebts) {
        await this.checkDebtNotificationsForDebt(debt, now);
      }

      // Send scheduled notifications
      await this.sendScheduledNotifications();
      
    } catch (error) {
      console.error('❌ Notification check error:', error);
    }
  }

  async checkDebtNotificationsForDebt(debt, now) {
    const dueDate = new Date(debt.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Check for before-due notifications
    if (debt.notifications && debt.notifications.beforeDue && debt.notifications.beforeDue.enabled && 
        daysDiff > 0 && daysDiff <= debt.notifications.beforeDue.daysBefore) {
      
      const lastSent = debt.notifications.beforeDue.lastSent;
      const shouldSend = !lastSent || 
        (now.getTime() - lastSent.getTime()) > 24 * 3600 * 1000;

      if (shouldSend) {
        await this.createDebtNotification(debt, 'before_due', daysDiff);
        debt.notifications.beforeDue.lastSent = now;
        await debt.save();
      }
    }

    // Check for on-due notifications
    if (debt.notifications && debt.notifications.onDue && debt.notifications.onDue.enabled && 
        daysDiff === 0) {
      
      const lastSent = debt.notifications.onDue.lastSent;
      const shouldSend = !lastSent || 
        now.toDateString() !== lastSent.toDateString();

      if (shouldSend) {
        await this.createDebtNotification(debt, 'on_due', 0);
        debt.notifications.onDue.lastSent = now;
        await debt.save();
      }
    }

    // Check for overdue notifications
    if (debt.notifications && debt.notifications.overdue && debt.notifications.overdue.enabled && 
        daysDiff < 0) {
      
      const overdueDays = Math.abs(daysDiff);
      const lastSent = debt.notifications.overdue.lastSent;
      const shouldSend = !lastSent || 
        overdueDays % debt.notifications.overdue.daysInterval === 0 ||
        (now.getTime() - lastSent.getTime()) > 
          debt.notifications.overdue.daysInterval * 24 * 3600 * 1000;

      if (shouldSend) {
        await this.createDebtNotification(debt, 'overdue', overdueDays);
        debt.notifications.overdue.lastSent = now;
        await debt.save();
      }
    }
  }

  async createDebtNotification(debt, type, days) {
    try {
      let title, message;
      const amount = debt.remainingAmount.toLocaleString('uz-UZ');
      
      switch(type) {
        case 'before_due':
          if (days === 3) {
            title = 'Qarz eslatmasi';
            message = `Qarz berish/qaytarishga 3 kun qoldi`;
          } else if (days === 1) {
            title = 'Qarz eslatmasi';
            message = `Ertaga qarz muddati tugaydi`;
          } else {
            title = 'Qarz eslatmasi';
            message = `${debt.personName} ${debt.type === 'borrow' ? 'dan olingan' : 'ga berilgan'} ${amount} so'm qarzning muddati ${days} kun qoldi`;
          }
          break;
        case 'on_due':
          title = 'Qarz eslatmasi';
          message = `Bugun qarzni yopish kuni`;
          break;
        case 'overdue':
          title = 'Qarz kechikdi';
          message = `${debt.personName} ${debt.type === 'borrow' ? 'dan olingan' : 'ga berilgan'} ${amount} so'm qarz ${Math.abs(days)} kun kechikdi`;
          break;
      }

      const notification = new Notification({
        userId: debt.userId,
        type: 'debt_reminder',
        title,
        message,
        data: {
          debtId: debt._id,
          debtType: debt.type,
          personName: debt.personName,
          amount: debt.remainingAmount,
          dueDate: debt.dueDate
        },
        priority: type === 'overdue' ? 'high' : 'medium',
        status: 'scheduled',
        channel: 'in_app',
        scheduledFor: new Date()
      });

      await notification.save();
      
      // Send immediately for in-app notifications
      await this.sendImmediateNotification(notification);
      
      return notification;
    } catch (error) {
      console.error('Create debt notification error:', error);
    }
  }

  async sendScheduledNotifications() {
    try {
      const now = new Date();
      const notifications = await Notification.find({
        status: 'scheduled',
        scheduledFor: { $lte: now }
      });

      for (const notification of notifications) {
        await this.sendImmediateNotification(notification);
        notification.status = 'sent';
        notification.sentAt = now;
        await notification.save();
      }
    } catch (error) {
      console.error('Send scheduled notifications error:', error);
    }
  }

  async sendImmediateNotification(notification) {
    try {
      // Send real-time notification via Socket.IO
      if (global.io) {
        global.io.to(`user_${notification.userId}`).emit('notification', {
          type: 'new_notification',
          notification: {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            priority: notification.priority,
            createdAt: notification.createdAt,
            data: notification.data
          }
        });
        console.log(`🔔 Real-time notification sent to user ${notification.userId}: ${notification.title}`);
      } else {
        console.log(`🔔 Notification created for user ${notification.userId}: ${notification.title} (Socket.IO not available)`);
      }

    } catch (error) {
      console.error('❌ Send notification error:', error);
      notification.status = 'failed';
      await notification.save();
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 50) {
    try {
      return await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      return await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { 
          status: 'read',
          readAt: new Date() 
        },
        { new: true }
      );
    } catch (error) {
      console.error('Mark as read error:', error);
      return null;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      return await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      return null;
    }
  }

  // Clear all notifications
  async clearAllNotifications(userId) {
    try {
      return await Notification.deleteMany({ userId });
    } catch (error) {
      console.error('Clear all notifications error:', error);
      return null;
    }
  }
}

module.exports = new NotificationService();