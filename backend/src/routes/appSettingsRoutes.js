const express = require('express');
const router = express.Router();
const AppSettings = require('../models/AppSettings');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Public: Get public settings (for frontend)
router.get('/public', async (req, res) => {
  try {
    const settings = await AppSettings.find({
      key: { 
        $in: [
          'pro_subscription_enabled',
          'challenges_enabled',
          'pro_monthly_price',
          'pro_yearly_price',
          'payment_card_number',
          'payment_card_holder',
          'maintenance_mode'
        ]
      }
    });

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    res.json({
      success: true,
      settings: settingsObj
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Get all settings
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const settings = await AppSettings.find().populate('updatedBy', 'firstName lastName email');

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Toggle Pro subscription
router.post('/toggle-pro', requireAdmin, async (req, res) => {
  try {
    const currentSetting = await AppSettings.getSetting('pro_subscription_enabled', false);
    const newValue = !currentSetting;

    await AppSettings.setSetting(
      'pro_subscription_enabled',
      newValue,
      'Pro obuna sotib olish imkoniyati',
      req.userId
    );

    res.json({
      success: true,
      message: newValue ? 'Pro obuna yoqildi' : 'Pro obuna o\'chirildi',
      enabled: newValue
    });
  } catch (error) {
    console.error('Toggle pro error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Toggle Challenges
router.post('/toggle-challenges', requireAdmin, async (req, res) => {
  try {
    const currentSetting = await AppSettings.getSetting('challenges_enabled', false);
    const newValue = !currentSetting;

    await AppSettings.setSetting(
      'challenges_enabled',
      newValue,
      'Challengelar funksiyasi',
      req.userId
    );

    res.json({
      success: true,
      message: newValue ? 'Challengelar yoqildi' : 'Challengelar o\'chirildi',
      enabled: newValue
    });
  } catch (error) {
    console.error('Toggle challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Update Pro prices - MUST be before /:key route
router.put('/pro-prices', requireAdmin, async (req, res) => {
  try {
    const { monthlyPrice, yearlyPrice } = req.body;
    console.log('Updating prices:', { monthlyPrice, yearlyPrice });

    if (monthlyPrice !== undefined) {
      await AppSettings.setSetting('pro_monthly_price', Number(monthlyPrice), 'Pro oylik narxi', req.userId);
    }
    if (yearlyPrice !== undefined) {
      await AppSettings.setSetting('pro_yearly_price', Number(yearlyPrice), 'Pro yillik narxi', req.userId);
    }

    res.json({
      success: true,
      message: 'Narxlar yangilandi'
    });
  } catch (error) {
    console.error('Update prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Update payment card info - MUST be before /:key route
router.put('/payment-card', requireAdmin, async (req, res) => {
  try {
    const { cardNumber, cardHolder } = req.body;
    console.log('Updating card:', { cardNumber, cardHolder });

    if (cardNumber !== undefined) {
      await AppSettings.setSetting('payment_card_number', cardNumber, 'To\'lov kartasi raqami', req.userId);
    }
    if (cardHolder !== undefined) {
      await AppSettings.setSetting('payment_card_holder', cardHolder, 'Karta egasi ismi', req.userId);
    }

    res.json({
      success: true,
      message: 'Karta ma\'lumotlari yangilandi'
    });
  } catch (error) {
    console.error('Update payment card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Initialize default settings on startup
router.post('/initialize', requireAdmin, async (req, res) => {
  try {
    await AppSettings.initializeDefaults();
    res.json({
      success: true,
      message: 'Sozlamalar ishga tushirildi'
    });
  } catch (error) {
    console.error('Initialize settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Update a setting by key - MUST be LAST because it catches all /:key patterns
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const setting = await AppSettings.setSetting(key, value, description, req.userId);

    res.json({
      success: true,
      message: 'Sozlama yangilandi',
      setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

module.exports = router;
