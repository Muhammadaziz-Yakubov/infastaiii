// InFast AI Bot Routes
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const infastAIBotService = require('../services/infastAIBotService');
const authMiddleware = require('../middleware/authMiddleware');

// Telegram ulash kodi yaratish
router.post('/generate-link-code', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 6 xonali tasodifiy kod yaratish
    const linkCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

    await User.findByIdAndUpdate(userId, {
      telegramLinkCode: linkCode,
      telegramLinkExpiry: expiry
    });

    res.json({
      success: true,
      data: {
        code: linkCode,
        expiresAt: expiry,
        botUsername: 'InFastAI_bot',
        instructions: [
          '1. Telegram\'da @InFastAI_bot ni oching',
          '2. /start buyrug\'ini yuboring',
          `3. /link ${linkCode} buyrug\'ini yuboring`
        ]
      }
    });
  } catch (error) {
    console.error('Generate link code error:', error);
    res.status(500).json({
      success: false,
      message: 'Kod yaratishda xatolik'
    });
  }
});

// Telegram ulanish holatini tekshirish
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        isLinked: !!user.telegramChatId,
        telegramUsername: user.telegramUsername,
        telegramFirstName: user.telegramFirstName,
        linkedAt: user.telegramLinkedAt,
        notifications: user.telegramNotifications || {
          enabled: true,
          debts: true,
          tasks: true,
          goals: true,
          dailyReport: false
        }
      }
    });
  } catch (error) {
    console.error('Get telegram status error:', error);
    res.status(500).json({
      success: false,
      message: 'Holatni olishda xatolik'
    });
  }
});

// Telegram ulanishni uzish
router.post('/unlink', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await User.findByIdAndUpdate(userId, {
      telegramChatId: null,
      telegramUsername: null,
      telegramFirstName: null,
      telegramLinkedAt: null,
      telegramLinkCode: null,
      telegramLinkExpiry: null
    });

    res.json({
      success: true,
      message: 'Telegram muvaffaqiyatli uzildi'
    });
  } catch (error) {
    console.error('Unlink telegram error:', error);
    res.status(500).json({
      success: false,
      message: 'Uzishda xatolik'
    });
  }
});

// Eslatma sozlamalarini yangilash
router.put('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled, debts, tasks, goals, dailyReport } = req.body;

    const user = await User.findById(userId);
    
    user.telegramNotifications = {
      enabled: enabled !== undefined ? enabled : user.telegramNotifications?.enabled ?? true,
      debts: debts !== undefined ? debts : user.telegramNotifications?.debts ?? true,
      tasks: tasks !== undefined ? tasks : user.telegramNotifications?.tasks ?? true,
      goals: goals !== undefined ? goals : user.telegramNotifications?.goals ?? true,
      dailyReport: dailyReport !== undefined ? dailyReport : user.telegramNotifications?.dailyReport ?? false
    };

    await user.save();

    res.json({
      success: true,
      data: user.telegramNotifications
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Sozlamalarni yangilashda xatolik'
    });
  }
});

// Test eslatma yuborish
router.post('/test-notification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.telegramChatId) {
      return res.status(400).json({
        success: false,
        message: 'Telegram ulanmagan'
      });
    }

    const sent = await infastAIBotService.sendMessage(
      user.telegramChatId,
      '🔔 **Test eslatma**\n\nBu test xabari. InFast AI bot muvaffaqiyatli ishlayapti!'
    );

    res.json({
      success: sent,
      message: sent ? 'Test xabari yuborildi' : 'Xabar yuborishda xatolik'
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Test xabarini yuborishda xatolik'
    });
  }
});

// Webhook endpoint (Telegram uchun)
router.post('/webhook', async (req, res) => {
  try {
    await infastAIBotService.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Bot health check
router.get('/health', async (req, res) => {
  try {
    const health = await infastAIBotService.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

module.exports = router;
