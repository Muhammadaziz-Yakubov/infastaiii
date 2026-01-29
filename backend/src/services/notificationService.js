// backend/src/services/notificationService.js
const Debt = require('../models/Debt');
const Notification = require('../models/Notification');
const Family = require('../models/Family');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Finance = require('../models/Finance');
const Challenge = require('../models/Challenge');

class NotificationService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.connectedUsers = new Map();
  }

  // Initialize with Socket.IO
  initialize(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('authenticate', async (data) => {
        try {
          const { userId, token } = data;
          
          // Verify token
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          if (decoded.userId === userId) {
            this.connectedUsers.set(userId, socket.id);
            socket.userId = userId;
            
            // Join user to their family rooms
            await this.joinFamilyRooms(socket, userId);
            
            socket.emit('authenticated', { success: true });
            console.log(`User ${userId} authenticated and connected`);
          }
        } catch (error) {
          socket.emit('authentication_error', { error: 'Invalid credentials' });
        }
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });

      socket.on('mark_notification_read', async (data) => {
        try {
          const { notificationId } = data;
          await this.markAsRead(notificationId, socket.userId);
          socket.emit('notification_marked_read', { notificationId });
        } catch (error) {
          socket.emit('error', { message: 'Failed to mark notification as read' });
        }
      });

      socket.on('mark_all_notifications_read', async () => {
        try {
          await this.markAllAsRead(socket.userId);
          socket.emit('all_notifications_marked_read');
        } catch (error) {
          socket.emit('error', { message: 'Failed to mark all notifications as read' });
        }
      });
    });
  }

  async joinFamilyRooms(socket, userId) {
    try {
      const families = await Family.find({
        $or: [
          { ownerId: userId },
          { 'members.userId': userId }
        ]
      });

      families.forEach(family => {
        socket.join(`family_${family._id}`);
      });
    } catch (error) {
      console.error('Error joining family rooms:', error);
    }
  }

  // Start notification service
  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔔 Notification service started');
    
    // Check every 5 minutes
    this.interval = setInterval(() => {
      this.checkDebtNotifications();
      this.checkTaskDeadlines();
      this.checkGoalDeadlines();
    }, 5 * 60 * 1000);
    
    // Initial check
    setTimeout(() => {
      this.checkDebtNotifications();
      this.checkTaskDeadlines();
      this.checkGoalDeadlines();
    }, 1000);
  }

  // Stop notification service
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.isRunning = false;
      console.log('🔔 Notification service stopped');
    }
  }

  // Check task deadlines
  async checkTaskDeadlines() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const tasks = await Task.find({
        status: { $in: ['pending', 'in_progress'] },
        deadline: { $lte: tomorrow }
      }).populate('familyId');

      for (const task of tasks) {
        await this.checkTaskNotification(task, now);
      }
    } catch (error) {
      console.error('Check task deadlines error:', error);
    }
  }

  async checkTaskNotification(task, now) {
    const deadline = new Date(task.deadline);
    const timeDiff = deadline.getTime() - now.getTime();
    const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));

    if (hoursDiff <= 24 && hoursDiff > 0) {
      await this.createTaskNotification(task, 'deadline_approaching', hoursDiff);
    } else if (hoursDiff <= 0) {
      await this.createTaskNotification(task, 'overdue', Math.abs(hoursDiff));
    }
  }

  async createTaskNotification(task, type, timeLeft) {
    try {
      let title, message;
      
      switch(type) {
        case 'deadline_approaching':
          title = 'Task Deadline Approaching';
          message = `Task "${task.title}" is due in ${timeLeft} hours`;
          break;
        case 'overdue':
          title = 'Task Overdue';
          message = `Task "${task.title}" is overdue by ${timeLeft} hours`;
          break;
      }

      const notification = new Notification({
        userId: task.assignedTo,
        type: 'task_reminder',
        title,
        message,
        data: {
          taskId: task._id,
          taskTitle: task.title,
          familyId: task.familyId._id,
          deadline: task.deadline
        },
        priority: type === 'overdue' ? 'high' : 'medium'
      });

      await notification.save();
      await this.sendImmediateNotification(notification);
      
      return notification;
    } catch (error) {
      console.error('Create task notification error:', error);
    }
  }

  // Check goal deadlines
  async checkGoalDeadlines() {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const goals = await Goal.find({
        deadline: { $lte: nextWeek },
        $expr: { $lt: ['$currentAmount', '$targetAmount'] }
      }).populate('familyId');

      for (const goal of goals) {
        await this.createGoalNotification(goal, now);
      }
    } catch (error) {
      console.error('Check goal deadlines error:', error);
    }
  }

  async createGoalNotification(goal, now) {
    try {
      const deadline = new Date(goal.deadline);
      const timeDiff = deadline.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const progress = (goal.currentAmount / goal.targetAmount * 100).toFixed(1);

      const notification = new Notification({
        userId: goal.createdBy,
        type: 'goal_reminder',
        title: 'Goal Deadline Approaching',
        message: `Goal "${goal.title}" is ${progress}% complete and due in ${daysDiff} days`,
        data: {
          goalId: goal._id,
          goalTitle: goal.title,
          progress,
          deadline: goal.deadline,
          familyId: goal.familyId._id
        },
        priority: daysDiff <= 3 ? 'high' : 'medium'
      });

      await notification.save();
      await this.sendImmediateNotification(notification);
      
      return notification;
    } catch (error) {
      console.error('Create goal notification error:', error);
    }
  }

  // Family notification methods
  async sendFamilyNotification(familyId, notificationData, excludeUserId = null) {
    try {
      const family = await Family.findById(familyId);
      if (!family) {
        throw new Error('Family not found');
      }

      const memberIds = family.members
        .map(member => member.userId.toString())
        .filter(id => id !== excludeUserId);

      const notifications = [];

      for (const userId of memberIds) {
        const notification = await this.sendNotification(userId, {
          ...notificationData,
          familyId
        });
        notifications.push(notification);
      }

      // Send to family room
      if (this.io) {
        this.io.to(`family_${familyId}`).emit('family_notification', {
          ...notificationData,
          familyId,
          excludeUserId
        });
      }

      return notifications;
    } catch (error) {
      console.error('Error sending family notification:', error);
      throw error;
    }
  }

  async sendNotification(userId, notificationData) {
    try {
      const notification = new Notification({
        userId,
        ...notificationData
      });

      await notification.save();
      await this.sendImmediateNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async notifyTaskAssigned(familyId, assignedTo, taskData, assignedBy) {
    const User = require('../models/User');
    const assignedUser = await User.findById(assignedTo);

    return this.sendNotification(assignedTo, {
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskData.title}`,
      data: {
        taskId: taskData._id,
        taskTitle: taskData.title,
        assignedBy,
        priority: taskData.priority,
        deadline: taskData.deadline,
        familyId
      },
      priority: taskData.priority === 'high' ? 'high' : 'normal'
    });
  }

  async notifyTaskCompleted(familyId, taskData, completedBy) {
    const User = require('../models/User');
    const user = await User.findById(completedBy);

    return this.sendFamilyNotification(familyId, {
      type: 'task_completed',
      title: 'Task Completed',
      message: `${user.firstName} completed the task: ${taskData.title}`,
      data: {
        taskId: taskData._id,
        taskTitle: taskData.title,
        completedBy,
        completedAt: new Date()
      },
      priority: 'normal'
    }, completedBy);
  }

  async notifyGoalAchieved(familyId, goalData) {
    return this.sendFamilyNotification(familyId, {
      type: 'goal_achieved',
      title: 'Goal Achieved! 🎉',
      message: `Congratulations! You achieved the goal: ${goalData.title}`,
      data: {
        goalId: goalData._id,
        goalTitle: goalData.title,
        targetAmount: goalData.targetAmount,
        achievedAt: new Date()
      },
      priority: 'high'
    });
  }

  async notifyFamilyInvitation(familyId, invitationData) {
    return this.sendNotification(invitationData.invitedBy, {
      type: 'invitation_sent',
      title: 'Invitation Sent',
      message: `Invitation sent to ${invitationData.invitedEmail || invitationData.invitedPhone}`,
      data: {
        familyId,
        invitationId: invitationData._id,
        inviteCode: invitationData.inviteCode,
        role: invitationData.role
      },
      priority: 'normal'
    });
  }

  async notifyInvitationAccepted(familyId, newMemberData) {
    const User = require('../models/User');
    const newUser = await User.findById(newMemberData.userId);

    return this.sendFamilyNotification(familyId, {
      type: 'member_joined',
      title: 'New Family Member',
      message: `${newUser.firstName} joined the family as ${newMemberData.role}`,
      data: {
        userId: newMemberData.userId,
        userName: newUser.firstName,
        role: newMemberData.role,
        joinedAt: new Date()
      },
      priority: 'normal'
    }, newMemberData.userId);
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
      if (this.io) {
        const socketId = this.connectedUsers.get(notification.userId);
        if (socketId) {
          this.io.to(socketId).emit('new_notification', notification);
        } else {
          this.io.to(`user_${notification.userId}`).emit('notification', {
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
        }
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
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type, isRead } = options;
      const skip = (page - 1) * limit;

      let query = { userId };
      if (type) query.type = type;
      if (isRead !== undefined) query.isRead = isRead;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('data.assignedBy', 'firstName lastName')
        .populate('data.completedBy', 'firstName lastName');

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      return { notifications: [], pagination: {}, unreadCount: 0 };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      return await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { 
          isRead: true,
          readAt: new Date() 
        },
        { new: true }
      );
    } catch (error) {
      console.error('Mark as read error:', error);
      return null;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      // Notify the user if they're connected
      const socketId = this.connectedUsers.get(userId);
      if (socketId && this.io) {
        this.io.to(socketId).emit('all_notifications_read');
      }

      return { message: 'All notifications marked as read' };
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });

      if (notification) {
        // Notify the user if they're connected
        const socketId = this.connectedUsers.get(userId);
        if (socketId && this.io) {
          this.io.to(socketId).emit('notification_deleted', { notificationId });
        }
      }

      return notification;
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