const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const FormData = require('form-data');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/receipts');
    console.log('Upload path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Submit payment
router.post('/submit', upload.single('receipt'), async (req, res) => {
  try {
    console.log('Payment submission received:', req.body);
    console.log('File:', req.file);

    const { plan, billingCycle, amount } = req.body;

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Chek fayli majburiy'
      });
    }

    console.log('Creating payment record...');
    const payment = new Payment({
      userId: req.userId,
      plan,
      billingCycle,
      amount: parseFloat(amount),
      receiptUrl: `/uploads/receipts/${req.file.filename}`,
      status: 'pending'
    });

    await payment.save();
    console.log('Payment saved:', payment._id);

    // Send to Telegram bot
    try {
      console.log('Sending to Telegram...');
      await sendToTelegramBot(payment, req.file);
      console.log('Telegram message sent successfully');
    } catch (telegramError) {
      console.error('Telegram error:', telegramError);
      // Don't fail the payment if Telegram fails
    }

    res.json({
      success: true,
      message: 'To\'lov yuborildi! Admin tekshirib, tasdiqlaydi.',
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi: ' + error.message
    });
  }
});

// Get user payments
router.get('/my-payments', async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Get all pending payments
router.get('/pending', async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement admin check)
    const payments = await Payment.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Approve payment
router.put('/:id/approve', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'To\'lov topilmadi'
      });
    }

    payment.status = 'approved';
    payment.approvedBy = req.userId;
    payment.approvedAt = new Date();

    await payment.save();

    // Update user subscription status
    await User.findByIdAndUpdate(payment.userId, {
      subscriptionPlan: payment.plan,
      subscriptionStatus: 'active',
      subscriptionEndDate: payment.subscriptionEndDate
    });

    // Send notification to user via Telegram
    await sendUserNotification(payment, 'approved');

    res.json({
      success: true,
      message: 'To\'lov tasdiqlandi',
      payment
    });

  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Admin: Reject payment
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'To\'lov topilmadi'
      });
    }

    payment.status = 'rejected';
    payment.rejectedReason = reason;
    payment.approvedBy = req.userId;
    payment.approvedAt = new Date();

    await payment.save();

    // Send notification to user via Telegram
    await sendUserNotification(payment, 'rejected', reason);

    res.json({
      success: true,
      message: 'To\'lov rad etildi',
      payment
    });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
});

// Telegram bot integration function
async function sendToTelegramBot(payment, file) {
  try {
    const botToken = '8478063592:AAFifIkLftx_ZtKjUiceQ6ictAdgAX2x7hA';
        const chatId = '-1003627626456'; // Admin group chat ID

    const message = `
🔔 Yangi to'lov!
👤 Foydalanuvchi: ${payment.userId} (ID: ${payment.userId})
📋 Plan: ${payment.plan}
💰 Miqdor: ${payment.amount} so'm
📅 Davriylik: ${payment.billingCycle === 'yearly' ? 'Yillik' : 'Oylik'}
⏰ Vaqt: ${payment.createdAt.toLocaleString('uz-UZ')}
📎 Chek: quyida
    `.trim();

    // Create inline keyboard
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Tasdiqlash', callback_data: `approve_${payment._id}` },
          { text: '❌ Rad etish', callback_data: `reject_${payment._id}` }
        ]
      ]
    };

    // Send message with inline keyboard
    const messageResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        reply_markup: inlineKeyboard,
      }),
    });

    const messageData = await messageResponse.json();

    // Store message ID for future updates
    if (messageData.ok) {
      payment.telegramMessageId = messageData.result.message_id;
      await payment.save();
    }

    // Send receipt as document instead of photo (simpler)
    const filePath = path.join(__dirname, '../../uploads/receipts', file.filename);

    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', fileBuffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
      formData.append('caption', `Chek - ${payment.plan} plan (${payment.amount} so'm)\nFayl: ${file.originalname}`);

      const documentResponse = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.telegram.org',
          path: `/bot${botToken}/sendDocument`,
          method: 'POST',
          headers: formData.getHeaders()
        }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve({ ok: false, error: e.message });
            }
          });
        });

        req.on('error', reject);
        formData.pipe(req);
      });

      console.log('Document send result:', documentResponse);
    } else {
      console.error('Receipt file not found:', filePath);
    }

  } catch (error) {
    console.error('Telegram bot error:', error);
  }
}

// Handle Telegram callback queries (button clicks)
router.post('/telegram/webhook', async (req, res) => {
  try {
    const { callback_query } = req.body;

    if (!callback_query) {
      return res.status(200).json({ ok: true });
    }

    const { data, message } = callback_query;
    const chatId = callback_query.from.id;

    // Parse callback data (approve_paymentId or reject_paymentId)
    const [action, paymentId] = data.split('_');

    if (!paymentId) {
      return res.status(200).json({ ok: true });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      await answerCallbackQuery(callback_query.id, 'To\'lov topilmadi');
      return res.status(200).json({ ok: true });
    }

    let resultMessage = '';
    let adminAction = '';

    if (action === 'approve') {
      payment.status = 'approved';
      payment.approvedBy = chatId; // Telegram user ID
      payment.approvedAt = new Date();
      resultMessage = `✅ To'lov tasdiqlandi!\nPlan: ${payment.plan}\nMiqdor: ${payment.amount} so'm`;
      adminAction = 'tasdiqlandi';
    } else if (action === 'reject') {
      payment.status = 'rejected';
      payment.approvedBy = chatId;
      payment.approvedAt = new Date();
      resultMessage = `❌ To'lov rad etildi!\nPlan: ${payment.plan}\nMiqdor: ${payment.amount} so'm`;
      adminAction = 'rad etildi';
    }

    await payment.save();

    // Update user subscription if approved
    if (action === 'approve') {
      await User.findByIdAndUpdate(payment.userId, {
        subscriptionPlan: payment.plan,
        subscriptionStatus: 'active',
        subscriptionEndDate: payment.subscriptionEndDate
      });
    }

    // Answer the callback query
    await answerCallbackQuery(callback_query.id, `To'lov ${adminAction}!`);

    // Edit the original message to show the result
    await editMessageText(message.chat.id, message.message_id, resultMessage);

    res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Helper function to answer callback query
async function answerCallbackQuery(callbackQueryId, text) {
  const botToken = '8478063592:AAFifIkLftx_ZtKjUiceQ6ictAdgAX2x7hA';

  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text,
      show_alert: false
    }),
  });
}

// Helper function to edit message text
async function editMessageText(chatId, messageId, text) {
  const botToken = '8478063592:AAFifIkLftx_ZtKjUiceQ6ictAdgAX2x7hA';

  await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text,
    }),
  });
}

// Helper function to send notification to user
async function sendUserNotification(payment, status, reason = '') {
  try {
    // For now, we'll log this. In production, you'd need user's Telegram ID
    // You can store telegramId in User model and send direct messages

    const statusText = status === 'approved' ? '✅ Tasdiqlandi' : '❌ Rad etildi';
    const message = `
${statusText}
📋 Plan: ${payment.plan}
💰 Miqdor: ${payment.amount} so'm
📅 Davriylik: ${payment.billingCycle === 'yearly' ? 'Yillik' : 'Oylik'}
${reason ? `📝 Sabab: ${reason}` : ''}
⏰ Vaqt: ${payment.approvedAt?.toLocaleString('uz-UZ') || new Date().toLocaleString('uz-UZ')}
    `.trim();

    console.log('User notification:', message);

    // TODO: Send to user's Telegram when you have their telegramId stored
    // const user = await User.findById(payment.userId);
    // if (user.telegramId) {
    //   await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       chat_id: user.telegramId,
    //       text: message,
    //     }),
    //   });
    // }

  } catch (error) {
    console.error('Send user notification error:', error);
  }
}

module.exports = router;
