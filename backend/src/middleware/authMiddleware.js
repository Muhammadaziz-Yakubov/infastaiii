// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Tokenni headerdan olish
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Tizimga kirish uchun autentifikatsiya qiling'
        });
    }

    try {
        // Tokenni tekshirish
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        const decoded = jwt.verify(token, jwtSecret);
        
        // User-ni topish
        const user = await User.findById(decoded.userId || decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        // Request-ga user ma'lumotlarini qo'shish
        req.user = user;
        req.userId = user._id;
        
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token noto\'g\'ri yoki muddati tugagan'
        });
    }
};

module.exports = protect; // ← BU MUHIM: Faqat funksiyani export qilish