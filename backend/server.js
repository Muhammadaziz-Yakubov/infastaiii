// server.js - Professional Rate Limiting
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const goalsRoutes = require('./src/routes/goals');
const taskRoutes = require('./src/routes/taskRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const archiveRoutes = require('./src/routes/archiveRoutes');
const userRoutes = require('./src/routes/userRoutes');
const settingsRoutes = require('./src/routes/settings');
const paymentRoutes = require('./src/routes/paymentRoutes');
const aiSuggestionsRoutes = require('./src/routes/aiSuggestions');
const adminRoutes = require('./src/routes/adminRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const challengeRoutes = require('./src/routes/challengeRoutes');
const telegramService = require('./src/services/telegramService');
const { checkBanStatus } = require('./src/middleware/adminMiddleware');

const cleanup = () => {
  console.log('🧹 Cleaning up services...');
  telegramService.stop();
  process.exit(0);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

const app = express();

// 🔹 TRUST PROXY
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// =============================================
// 🎯 PROFESSIONAL RATE LIMITING
// =============================================

// Custom key generator - IP + User-Agent kombinatsiyasi
const customKeyGenerator = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  const userAgent = req.headers['user-agent'] || 'unknown';
  return `${ip}-${userAgent.substring(0, 50)}`;
};

// 1️⃣ UMUMIY API RATE LIMIT - Juda yuqori
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 1000, // 15 daqiqada 1000 ta so'rov
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: customKeyGenerator,
  skip: (req) => process.env.NODE_ENV === 'development'
});

// 2️⃣ AUTH ENDPOINTS - Moslashuvchan limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: async (req) => {
    // Turli endpointlar uchun turli limitlar
    if (req.path === '/login' || req.path === '/register') {
      return 20; // Login/Register: 20 urinish
    }
    if (req.path === '/verify-email' || req.path === '/resend-verification') {
      return 10; // Email verification: 10 urinish
    }
    if (req.path === '/forgot-password' || req.path === '/reset-password') {
      return 5; // Password reset: 5 urinish
    }
    return 50; // Boshqa auth endpointlar: 50 urinish
  },
  message: (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000);
    return {
      success: false,
      message: 'Too many authentication attempts',
      retryAfter: `${Math.ceil(retryAfter / 60)} minutes`,
      retryAfterSeconds: retryAfter
    };
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: customKeyGenerator,
  skip: (req) => process.env.NODE_ENV === 'development',
  // Google OAuth'ni skip qilish
  skipSuccessfulRequests: true, // Muvaffaqiyatli so'rovlar hisoblanmaydi
});

// 3️⃣ FAILED LOGIN ATTEMPTS - Juda qattiq
const loginFailureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 soat
  max: 5, // Faqat 5 ta muvaffaqiyatsiz urinish
  skipSuccessfulRequests: true, // Muvaffaqiyatli loginlar hisoblanmaydi
  message: {
    success: false,
    message: 'Too many failed login attempts. Your account is temporarily locked.',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => {
    // Email + IP kombinatsiyasi
    const email = req.body?.email?.toLowerCase() || 'unknown';
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    return `login-fail-${email}-${ip}`;
  },
  skip: (req) => process.env.NODE_ENV === 'development'
});

// 4️⃣ GOOGLE OAUTH - Limitdan ozod
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Google OAuth uchun keng limit
  message: {
    success: false,
    message: 'Too many OAuth attempts',
    retryAfter: '15 minutes'
  },
  keyGenerator: customKeyGenerator,
  skip: (req) => process.env.NODE_ENV === 'development'
});

// =============================================
// SECURITY MIDDLEWARE
// =============================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "https://apis.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com"],
    },
  },
}));

// =============================================
// BASIC MIDDLEWARE
// =============================================

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('http://0.0.0.0:') ||
          origin.includes('.vercel.app') ||
          origin.includes('vercel.sh')) {
        return callback(null, true);
      }
    }

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://www.infastproject.uz',
      'https://infastproject.uz',
      'https://infastaiii.vercel.app', // Backup
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error('CORS policy: Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const receiptsDir = path.join(uploadsDir, 'receipts');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir);
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) res.setHeader('Content-Type', 'image/jpeg');
    else if (path.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
    else if (path.endsWith('.gif')) res.setHeader('Content-Type', 'image/gif');
    else if (path.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp');

    const origin = res.req.headers.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://www.infastproject.uz',
      'https://infastproject.uz',
      'https://infastaiii.vercel.app', // Backup
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// =============================================
// ROUTES WITH SMART RATE LIMITING
// =============================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'InFast AI API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      health: '/api/auth/health'
    }
  });
});

// 🎯 Public routes - No authentication required
app.use('/api/public', publicRoutes);

// 🎯 Auth routes - Special handling
app.use('/api/auth/google', oauthLimiter); // Google OAuth
app.use('/api/auth', authLimiter, authRoutes); // Boshqa auth endpoints

// 🎯 Umumiy API routes - Keng limit
app.use('/api/', apiLimiter); // Barcha API endpointlarga

// 🎯 Ban check middleware - Barcha API endpointlar uchun
app.use('/api/', checkBanStatus);

// Admin routes (before other routes to avoid ban check)
app.use('/api/admin', adminRoutes);

// Regular API routes
app.use('/api/goals', goalsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai-suggestions', aiSuggestionsRoutes);
app.use('/api/challenges', challengeRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });
  if (err.message && err.message.includes('CORS')) return res.status(403).json({ success: false, message: 'CORS policy violation' });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// =============================================
// DATABASE CONNECTION
// =============================================

const connectDB = async (retries = 5, delay = 3000) => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    process.exit(1);
  }

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongoURI);
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, delay));
      else {
        console.error('❌ Failed to connect to MongoDB after', retries, 'attempts');
        process.exit(1);
      }
    }
  }
};

// =============================================
// SERVER STARTUP
// =============================================

let server;
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log('🚀 InFast AI Authentication Server');
      console.log(`Port: ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Started: ${new Date().toLocaleString()}`);
      console.log('MongoDB: ✅ Connected');
      console.log('JWT Auth: ✅ Enabled');
      console.log('Google OAuth: ✅ Configured');
      console.log('Rate Limiting: ✅ Smart & Flexible');
      console.log('  - API General: 1000 req/15min');
      console.log('  - Auth Login: 20 req/15min');
      console.log('  - Password Reset: 5 req/15min');
      console.log('  - Google OAuth: 100 req/15min');
      console.log('Security: ✅ Helmet enabled');
      
      telegramService.init().then(() => {
        console.log('✅ All services initialized');
      }).catch((error) => {
        console.error('❌ Telegram service initialization failed:', error);
      });
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();