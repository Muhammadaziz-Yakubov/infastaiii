// Support Bot Routes
const express = require('express');
const router = express.Router();
const supportBotService = require('../services/supportBotService');

// Webhook endpoint for Support bot
router.post('/webhook', async (req, res) => {
  try {
    console.log('📩 Support webhook received');
    await supportBotService.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Support webhook error:', error);
    res.sendStatus(500);
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const health = await supportBotService.healthCheck();
    res.json({
      success: true,
      service: 'Support Bot',
      ...health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
