const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('To\'g\'ri email kiriting'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Ism kiritilishi shart'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Familiya kiritilishi shart')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('To\'g\'ri email kiriting'),
  body('password')
    .notEmpty()
    .withMessage('Parol kiritilishi shart')
];

// =============================================
// TELEGRAM WEBHOOK (PRODUCTION)
// =============================================

/**
 * @route   POST /api/auth/telegram/webhook
 * @desc    Telegram webhook endpoint (Production only)
 * @access  Public
 */
router.post('/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('📥 Telegram webhook received');
    
    const telegramService = require('../services/telegramService');
    
    if (!telegramService.bot) {
      console.error('❌ Bot not initialized');
      return res.status(200).send('OK'); // Still return 200 to avoid Telegram retries
    }
    
    // Process update
    await telegramService.processUpdate(update);
    
    // MUHIM: Telegram'ga doim 200 OK qaytarish
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Xatolik bo'lsa ham 200 qaytarish (Telegram qayta urinmasligi uchun)
    res.status(200).send('OK');
  }
});

// =============================================
// EMAIL AUTHENTICATION ROUTES (TELEGRAM-STYLE)
// =============================================

/**
 * @route   POST /api/auth/check-phone
 * @desc    Check phone and determine auth flow
 * @access  Public
 */
router.post('/check-phone', [
  body('phone')
    .isMobilePhone('uz-UZ')
    .withMessage('To\'g\'ri telefon raqam kiriting (+998xxxxxxxxx)')
], authController.checkPhone);

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const emailService = require('../services/emailService');
    const code = '123456'; // Test code
    await emailService.sendVerificationCode(email, 'Test User', code);

    res.json({
      success: true,
      message: 'Test email sent! Check your inbox for code: 123456',
      testCode: code // Only for testing - remove in production
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test Telegram bot endpoint
router.get('/test-bot', async (req, res) => {
  try {
    const telegramService = require('../services/telegramService');
    const health = await telegramService.healthCheck();

    res.json({
      success: true,
      message: 'Bot health check completed',
      bot: health
    });
  } catch (error) {
    console.error('Bot test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-phone-otp
 * @desc    Verify phone OTP for new users
 * @access  Public
 */
router.post('/verify-phone-otp', [
  body('phone')
    .isMobilePhone('uz-UZ')
    .withMessage('To\'g\'ri telefon raqam kiriting (+998xxxxxxxxx)'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP 6 ta raqamdan iborat bo\'lishi kerak')
], authController.verifyPhoneOTP);

/**
 * @route   POST /api/auth/create-password
 * @desc    Create password for verified email users
 * @access  Public
 */
const upload = require('../middleware/upload');
router.post('/create-password', 
  upload.single('avatar'), // Handle avatar upload
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
    body('firstName')
      .optional()
      .trim(),
    body('lastName')
      .optional()
      .trim()
  ], 
  authController.createPassword
);

/**
 * @route   POST /api/auth/login
 * @desc    Password login for existing email users
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('To\'g\'ri email kiriting'),
  body('password')
    .notEmpty()
    .withMessage('Parol kiritilishi shart')
], authController.loginWithPassword);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with verification code
 * @access  Public
 */
router.post('/verify-email', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('To\'g\'ri email kiriting'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Kod 6 ta raqamdan iborat bo\'lishi kerak')
], authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-email-verification
 * @desc    Resend email verification code
 * @access  Public
 */
router.post('/resend-email-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('To\'g\'ri email kiriting')
], authController.resendEmailVerification);

// =============================================
// GOOGLE AUTHENTICATION ROUTES
// =============================================

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get('/google', authController.googleAuth);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback handler
 * @access  Public
 */
router.get('/google/callback', authController.googleCallback);

// =============================================
// PHONE AUTHENTICATION ROUTES
// =============================================

/**
 * @route   POST /api/auth/send-sms-code
 * @desc    Send SMS verification code
 * @access  Public
 */
router.post('/send-sms-code', [
  body('phone')
    .notEmpty()
    .withMessage('Telefon raqam kiritilishi shart')
], authController.sendSMSCode);

/**
 * @route   POST /api/auth/verify-sms-code
 * @desc    Verify SMS code
 * @access  Public
 */
router.post('/verify-sms-code', [
  body('phone')
    .notEmpty()
    .withMessage('Telefon raqam kiritilishi shart'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Kod 6 ta raqamdan iborat bo\'lishi kerak')
], authController.verifySMSCode);

/**
 * @route   POST /api/auth/register-phone
 * @desc    Register with phone after SMS verification
 * @access  Public
 */
router.post('/register-phone', [
  body('tempToken')
    .notEmpty()
    .withMessage('Vaqtinchalik token kiritilishi shart'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Ism kiritilishi shart'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Familiya kiritilishi shart'),
  body('birthday')
    .isISO8601()
    .withMessage('Tug\'ilgan kun noto\'g\'ri formatda')
], authController.registerWithPhone);

/**
 * @route   POST /api/auth/login-phone
 * @desc    Login with phone and password
 * @access  Public
 */
router.post('/login-phone', [
  body('phone')
    .notEmpty()
    .withMessage('Telefon raqam kiritilishi shart'),
  body('password')
    .notEmpty()
    .withMessage('Parol kiritilishi shart')
], authController.loginWithPhone);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot password for phone users
 * @access  Public
 */
router.post('/forgot-password', [
  body('phone')
    .notEmpty()
    .withMessage('Telefon raqam kiritilishi shart')
], authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with verification code
 * @access  Public
 */
router.post('/reset-password', [
  body('phone')
    .notEmpty()
    .withMessage('Telefon raqam kiritilishi shart'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Kod 6 ta raqamdan iborat bo\'lishi kerak'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak')
], authController.resetPassword);

// =============================================
// PROTECTED ROUTES (Require Authentication)
// =============================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authController.authenticate, authController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side)
 * @access  Private
 */
router.post('/logout', authController.authenticate, authController.logout);

// =============================================
// HEALTH CHECK
// =============================================

/**
 * @route   GET /api/auth/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;