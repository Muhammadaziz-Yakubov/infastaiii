const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

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

// ============================================
// PROTECTED ROUTES - Auth required
// ============================================
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

    // Telegram bot o'chirildi - Admin paneldan tasdiqlash
    // try {
    //   console.log('Sending to Telegram...');
    //   await sendToTelegramBot(payment, req.file);
    //   console.log('Telegram message sent successfully');
    // } catch (telegramError) {
    //   console.error('Telegram error:', telegramError);
    // }

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
      subscriptionType: payment.plan === 'Pro' ? 'premium' : 'free',
      subscriptionPlan: payment.plan,
      subscriptionStatus: 'active',
      subscriptionEndDate: payment.subscriptionEndDate
    });

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

module.exports = router;
