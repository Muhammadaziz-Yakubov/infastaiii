// src/controllers/authController.js - Authentication Controller
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const emailService = require('../services/emailService');

// JWT Token Generation
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { expiresIn: payload.userId ? '30d' : '10m' } // 30 days for user tokens, 10 minutes for temp tokens
  );
};

// Google OAuth Client
// Redirect URI must point to backend, not frontend
const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:5000';
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  `${BACKEND_URL}/api/auth/google/callback`
);

// Generate JWT Token

// =============================================
// EMAIL AUTHENTICATION (TELEGRAM-STYLE)
// =============================================

// Step 1: Check email and redirect to appropriate flow
exports.checkPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Telefon raqam kiritilishi shart'
      });
    }

    // Normalize phone number (add + if not present)
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    // Check if user exists
    const user = await User.findOne({ phone: normalizedPhone });

    if (user) {
      // Existing user - redirect to password login
      return res.json({
        success: true,
        userExists: true,
        message: 'Bu telefon raqam mavjud. Parolingizni kiriting.'
      });
    } else {
      // New user - generate OTP for Telegram bot
      const { otp, code } = await VerificationCode.createOTP(normalizedPhone, 'phone_verification');

      console.log(`📱 New user registration for phone: ${normalizedPhone}`);
      console.log(`🔢 VERIFICATION CODE: ${code} (User should get this from Telegram bot)`);
      console.log(`🤖 User needs to: 1) Go to Telegram bot, 2) Press /start, 3) Share contact`);

      return res.json({
        success: true,
        userExists: false,
        message: 'Telegram botga boring va /start bosib, kontaktni ulashing. 3 daqiqa amal qiluvchi kod olishingiz mumkin.',
        phone: normalizedPhone,
        tempToken: generateToken({ phone: normalizedPhone, type: 'phone_verification' }) // Temporary token for verification
      });
    }

  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Step 2: Verify OTP for new users
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp, tempToken } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Telefon raqam va OTP kiritilishi shart'
      });
    }

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    // Normalize OTP - ensure it's a string and remove any whitespace
    const normalizedOtp = String(otp).trim().replace(/\s/g, '');

    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(normalizedOtp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP kod 6 ta raqamdan iborat bo\'lishi kerak'
      });
    }

    // Find the OTP record
    const otpRecord = await VerificationCode.findOne({
      phone: normalizedPhone,
      type: 'phone_verification',
      used: false
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Tasdiqlash kodi topilmadi yoki muddati tugagan. Telegram bot orqali yangi kod oling.'
      });
    }

    // Check expiration manually first
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Tasdiqlash kodi muddati tugagan. Telegram bot orqali yangi kod oling.'
      });
    }

    // Verify the OTP
    try {
      await otpRecord.verifyCode(normalizedOtp);
    } catch (error) {
      console.error('OTP verification error:', error.message);
      console.error('OTP record:', {
        phone: otpRecord.phone,
        type: otpRecord.type,
        used: otpRecord.used,
        attempts: otpRecord.attempts,
        expiresAt: otpRecord.expiresAt
      });

      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message === 'Invalid code') {
        errorMessage = `Noto'g'ri kod. Qolgan urinishlar: ${3 - otpRecord.attempts}`;
      } else if (error.message === 'Too many attempts') {
        errorMessage = 'Juda ko\'p noto\'g\'ri urinishlar. Telegram bot orqali yangi kod oling.';
      } else if (error.message === 'Code already used') {
        errorMessage = 'Bu kod allaqachon ishlatilgan. Telegram bot orqali yangi kod oling.';
      }

      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    // OTP verified successfully - create temp token for password creation
    const passwordToken = generateToken({
      phone: normalizedPhone,
      verified: true,
      type: 'password_creation'
    });

    res.json({
      success: true,
      message: 'Telefon raqam tasdiqlandi. Endi parol yarating.',
      tempToken: passwordToken
    });

  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Step 3: Create password for new users
exports.createPassword = async (req, res) => {
  try {
    // Handle both JSON and FormData
    const tempToken = req.body.tempToken;
    const password = req.body.password;
    // For FormData, fields come as strings, ensure proper handling
    const firstName = (req.body.firstName && String(req.body.firstName).trim()) || 'Foydalanuvchi';
    const lastName = (req.body.lastName && String(req.body.lastName).trim()) || 'User';

    if (!tempToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Temp token va parol kiritilishi shart'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
      });
    }

    // Ensure names are not empty after trimming
    if (!firstName || firstName.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ism kiritilishi shart'
      });
    }

    if (!lastName || lastName.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Familiya kiritilishi shart'
      });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Tasdiqlash muddati tugagan. Qaytadan boshlang.'
      });
    }

    if (decoded.type !== 'password_creation' || !decoded.verified) {
      return res.status(401).json({
        success: false,
        message: 'Noto\'g\'ri token'
      });
    }

    // Determine auth method and check existing user
    let existingUser;
    let authProvider;
    let userData = {
      password,
      firstName,
      lastName,
      avatar: req.file ? `/uploads/avatars/${req.file.filename}` : null
    };

    if (decoded.email) {
      // Email verification
      existingUser = await User.findOne({ email: decoded.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
        });
      }
      userData.email = decoded.email;
      userData.authProvider = 'email';
      userData.emailVerified = true;
    } else if (decoded.phone) {
      // Phone verification
      existingUser = await User.findOne({ phone: decoded.phone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan'
        });
      }
      userData.phone = decoded.phone;
      userData.authProvider = 'phone';
      userData.phoneVerified = true;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tasdiqlash ma\'lumotlari topilmadi'
      });
    }

    // Create new user with provided info
    const user = new User(userData);

    try {
      await user.save();
    } catch (saveError) {
      console.error('User save error:', saveError);
      
      // Handle duplicate email error
      if (saveError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
        });
      }
      
      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: errors.join(', ')
        });
      }
      
      throw saveError; // Re-throw other errors
    }

    // Generate JWT token
    const token = generateToken({ userId: user._id });

    res.status(201).json({
      success: true,
      message: 'Ro\'yxatdan o\'tish muvaffaqiyatli!',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        authProvider: user.authProvider,
        avatar: user.avatar,
        subscriptionType: user.subscriptionType
      }
    });

  } catch (error) {
    console.error('Create password error:', error);
    
    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? `Server xatosi: ${error.message}`
        : 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.'
    });
  }
};

// Password login for existing users
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email va parol kiritilishi shart'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Check if user has email auth
    if (user.authProvider !== 'email') {
      return res.status(401).json({
        success: false,
        message: `Bu email ${user.authProvider === 'google' ? 'Google' : 'Telefon'} orqali ro'yxatdan o'tgan`
      });
    }

    // Check if user has password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Parol o\'rnatilmagan. Iltimos, parolni tiklang'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hisob faolsizlantirilgan'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({ userId: user._id });

    res.json({
      success: true,
      message: 'Kirish muvaffaqiyatli!',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        authProvider: user.authProvider,
        subscriptionType: user.subscriptionType
      }
    });

  } catch (error) {
    console.error('Login with password error:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? `Server xatosi: ${error.message}`
        : 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.'
    });
  }
};

// Login with email and password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hisob faolsizlantirilgan'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({ userId: user._id });

    res.json({
      success: true,
      message: 'Kirish muvaffaqiyatli!',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        subscriptionType: user.subscriptionType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi. Qayta urinib ko\'ring.'
    });
  }
};

// =============================================
// GOOGLE AUTHENTICATION (SEPARATE FLOW)
// =============================================

// Initiate Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const callbackUrl = `${BACKEND_URL}/api/auth/google/callback`;
    
    const authorizeUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
      redirect_uri: callbackUrl
    });

    res.json({
      success: true,
      authUrl: authorizeUrl
    });

  } catch (error) {
    console.error('Google auth init error:', error);
    res.status(500).json({
      success: false,
      message: 'Google autentifikatsiya xatosi'
    });
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      return res.redirect(`${frontendUrl}/auth?error=google_auth_failed`);
    }

    // Get tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id'
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture: avatar, name: fullName } = payload;

    if (!email) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      return res.redirect(`${frontendUrl}/auth?error=google_email_missing`);
    }

    // Handle name fields - prefer given_name/family_name, fallback to splitting full name
    let firstName = given_name;
    let lastName = family_name;

    if (!firstName && !lastName && fullName) {
      const nameParts = fullName.trim().split(' ');
      firstName = nameParts[0] || 'Google';
      lastName = nameParts.slice(1).join(' ') || 'User';
    }

    firstName = firstName || 'Google';
    lastName = lastName || 'User';

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with this email
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Email exists - login with existing account
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.avatar = avatar || user.avatar;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // New user - create Google account
      user = new User({
        googleId,
        email: normalizedEmail,
        firstName,
        lastName,
        avatar,
        authProvider: 'google',
        emailVerified: true // Google emails are verified
      });
      await user.save();
    }

    // Generate token
    const token = generateToken({ userId: user._id });

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);

  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/auth?error=google_auth_failed`);
  }
};

// =============================================
// PHONE AUTHENTICATION
// =============================================

// Send SMS verification code
exports.sendSMSCode = async (req, res) => {
  try {
    const { phone } = req.body;

    // Check if user already exists with this phone
    const existingUser = await User.findOne({ phone });
    const userExists = !!existingUser;

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save verification code (using email field temporarily for phone verification)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes

    await VerificationCode.create({
      email: `phone_${phone}`, // Use phone as identifier
      code: verificationCode,
      type: 'phone_verification',
      expiresAt
    });

    // In development, log the code
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 SMS Code for ${phone}: ${verificationCode}`);
    }

    res.json({
      success: true,
      message: 'SMS kod yuborildi',
      userExists,
      tempToken: 'temp_' + Date.now() // Simple temp token for development
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'SMS yuborishda xatolik'
    });
  }
};

// Verify SMS code
exports.verifySMSCode = async (req, res) => {
  try {
    const { phone, code } = req.body;

    // Find verification code
    const verificationRecord = await VerificationCode.findOne({
      email: `phone_${phone}`,
      code,
      type: 'phone_verification'
    });

    if (!verificationRecord) {
      return res.status(400).json({
        success: false,
        message: 'Kod noto\'g\'ri yoki muddati tugagan'
      });
    }

    // Check if code is expired
    if (verificationRecord.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Kod muddati tugagan'
      });
    }

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      // New user - create temporary user record
      user = new User({
        phone,
        firstName: '',
        lastName: '',
        email: '', // Will be filled during registration
        emailVerified: false
      });
      await user.save();
    }

    // Delete used verification code
    await VerificationCode.deleteOne({ _id: verificationRecord._id });

    // Generate temp token for registration/login
    const tempToken = generateToken({ userId: user._id, type: 'password_creation' });

    res.json({
      success: true,
      message: 'Kod tasdiqlandi',
      userExists: !!user.firstName, // If firstName exists, user is registered
      tempToken
    });

  } catch (error) {
    console.error('Verify SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Register with phone after SMS verification
exports.registerWithPhone = async (req, res) => {
  try {
    const { tempToken, firstName, lastName, birthday } = req.body;

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Update user info
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.birthday = new Date(birthday);
    await user.save();

    // Generate real token
    const token = generateToken({ userId: user._id });

    res.json({
      success: true,
      message: 'Ro\'yxatdan o\'tish muvaffaqiyatli!',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        birthday: user.birthday
      }
    });

  } catch (error) {
    console.error('Register with phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Login with phone and password
exports.loginWithPhone = async (req, res) => {
  try {
    const { phone, password, tempToken } = req.body;

    // Validate required fields
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Telefon raqam va parol kiritilishi shart'
      });
    }

    // If tempToken is provided, verify it (for OTP flow)
    let userId = null;
    if (tempToken) {
      try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (tokenError) {
        return res.status(401).json({
          success: false,
          message: 'Yaroqsiz yoki muddati tugagan token'
        });
      }
    }

    // Find user by phone or userId
    let user;
    if (userId) {
      user = await User.findById(userId);
      if (user && user.phone !== phone) {
        return res.status(401).json({
          success: false,
          message: 'Telefon raqam noto\'g\'ri'
        });
      }
    } else {
      // Direct login with phone and password (no tempToken)
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Telefon raqam yoki parol noto\'g\'ri'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Parol noto\'g\'ri'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hisob faolsizlantirilgan'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({ userId: user._id });

    res.json({
      success: true,
      message: 'Kirish muvaffaqiyatli!',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        subscriptionType: user.subscriptionType
      }
    });

  } catch (error) {
    console.error('Login with phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Forgot password for phone users
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu telefon raqam bilan hisob topilmadi'
      });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save verification code
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await VerificationCode.create({
      email: `phone_${phone}`,
      code: verificationCode,
      type: 'phone_reset_password',
      expiresAt
    });

    // In development, log the code
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 Password Reset Code for ${phone}: ${verificationCode}`);
    }

    res.json({
      success: true,
      message: 'Parolni tiklash kodi yuborildi'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Reset password with code
exports.resetPassword = async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;

    // Find verification code
    const verificationRecord = await VerificationCode.findOne({
      email: `phone_${phone}`,
      code,
      type: 'phone_reset_password'
    });

    if (!verificationRecord) {
      return res.status(400).json({
        success: false,
        message: 'Kod noto\'g\'ri yoki muddati tugagan'
      });
    }

    // Check if code is expired
    if (verificationRecord.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Kod muddati tugagan'
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete used verification code
    await VerificationCode.deleteOne({ _id: verificationRecord._id });

    res.json({
      success: true,
      message: 'Parol muvaffaqiyatli o\'zgartirildi'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Verify email with code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find verification code
    const verificationRecord = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code,
      type: 'email_verification'
    });

    if (!verificationRecord) {
      return res.status(400).json({
        success: false,
        message: 'Kod noto\'g\'ri yoki muddati tugagan'
      });
    }

    // Check if code is expired
    if (verificationRecord.expiresAt < new Date()) {
      await VerificationCode.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Kod muddati tugagan'
      });
    }

    // Find user and verify email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    await user.save();

    // Delete used verification code
    await VerificationCode.deleteOne({ _id: verificationRecord._id });

    // Generate token
    const token = generateToken({ userId: user._id });

    res.json({
      success: true,
      message: 'Email muvaffaqiyatli tasdiqlandi!',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Resend email verification code (for OTP flow)
exports.resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email kiritilishi shart'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists (for existing users, we don't resend OTP)
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Bu email allaqachon ro\'yxatdan o\'tgan. Parol bilan kirishingiz mumkin.'
      });
    }

    // Delete old OTP codes for this email
    await VerificationCode.deleteMany({
      email: normalizedEmail,
      type: 'email_verification',
      used: false
    });

    // Generate new OTP
    const { otp, code } = await VerificationCode.createOTP(normalizedEmail, 'email_verification');

    // Send verification email
    let emailSent = false;
    try {
      await emailService.sendVerificationCode(normalizedEmail, 'Foydalanuvchi', code);
      console.log(`✅ OTP resent to ${normalizedEmail}`);
      // Security: Never log the actual code in production
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️  DEVELOPMENT MODE ONLY - New OTP code: ${code} (Check backend console)`);
      }
      emailSent = true;
    } catch (emailError) {
      console.error('Email yuborishda xatolik:', emailError.message);
      // In development, log code to console only (not to frontend)
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️  DEVELOPMENT MODE ONLY - Email failed. New OTP code: ${code} (Check backend console)`);
        console.error('Email error details:', emailError);
        emailSent = true; // Allow flow to continue in development
      } else {
        return res.status(500).json({
          success: false,
          message: 'Email yuborishda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.'
        });
      }
    }

    res.json({
      success: true,
      message: 'Yangi tasdiqlash kodi emailga yuborildi',
      tempToken: generateToken({ email: normalizedEmail, type: 'email_verification' }),
      emailSent
    });

  } catch (error) {
    console.error('Resend email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// =============================================
// GENERAL AUTH METHODS
// =============================================

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -googleAccessToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        subscriptionType: user.subscriptionType,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Chiqish muvaffaqiyatli'
  });
};

// Verify token middleware
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token mavjud emas'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token yaroqsiz yoki foydalanuvchi faolsizlantirilgan'
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token yaroqsiz'
    });
  }
};