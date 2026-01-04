// server/routes/settings.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Finance = require('../models/Finance');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const { Parser } = require('json2csv');

// Sozlamalarni olish
router.get('/user/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('settings');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Foydalanuvchi topilmadi' 
      });
    }
    
    res.json({
      success: true,
      settings: user.settings || {
        defaultCurrency: 'UZS',
        currencyRates: {
          USD: 12022.47,
          RUB: 148.98
        },
        autoUpdateRates: true,
        language: 'uz'
      }
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi' 
    });
  }
});

// Sozlamalarni yangilash
router.put('/user/settings', auth, async (req, res) => {
  try {
    const { settings } = req.body;
    
    await User.findByIdAndUpdate(req.userId, {
      $set: { settings }
    });
    
    res.json({
      success: true,
      message: 'Sozlamalar saqlandi'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server xatosi' 
    });
  }
});

// Tranzaksiyalarni CSV ga eksport qilish
router.get('/finance/transactions/export', auth, async (req, res) => {
  try {
    const transactions = await Finance.find({ userId: req.userId })
      .sort('-date')
      .lean();
    
    const fields = [
      'date',
      'type',
      'amount',
      'category',
      'description',
      'createdAt'
    ];
    
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(transactions);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('tranzaksiyalar.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eksportda xatolik' 
    });
  }
});

// Vazifalarni CSV ga eksport qilish
router.get('/tasks/export', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .sort('-createdAt')
      .lean();
    
    const fields = [
      'title',
      'description',
      'status',
      'priority',
      'deadline',
      'tags',
      'estimatedHours',
      'createdAt'
    ];
    
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(tasks);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('vazifalar.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eksportda xatolik' 
    });
  }
});

// Barcha tranzaksiyalarni o'chirish
router.delete('/finance/transactions/all', auth, async (req, res) => {
  try {
    await Finance.deleteMany({ userId: req.userId });
    
    res.json({
      success: true,
      message: 'Barcha tranzaksiyalar o\'chirildi'
    });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'O\'chirishda xatolik' 
    });
  }
});

// Barcha vazifalarni o'chirish
router.delete('/tasks/all', auth, async (req, res) => {
  try {
    await Task.deleteMany({ userId: req.userId });
    
    res.json({
      success: true,
      message: 'Barcha vazifalar o\'chirildi'
    });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'O\'chirishda xatolik' 
    });
  }
});

module.exports = router;