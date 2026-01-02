// backend/src/controllers/financeController.js
const Finance = require('../models/Finance');
const FinanceCategory = require('../models/FinanceCategory');

// Get all transactions with filters
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, sort } = req.query;
    const userId = req.userId;

    // Build query
    const query = { userId };
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Sort
    let sortObj = { date: -1 }; // Default: newest first
    if (sort === 'amount-high') sortObj = { amount: -1 };
    else if (sort === 'amount-low') sortObj = { amount: 1 };
    else if (sort === 'oldest') sortObj = { date: 1 };

    const transactions = await Finance.find(query).sort(sortObj);

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Tranzaksiya topilmadi'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, paymentMethod, recurring, recurringFrequency, tags } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Tur, summa va kategoriya kerak'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Summa 0 dan katta bo\'lishi kerak'
      });
    }

    const transaction = await Finance.create({
      userId: req.userId,
      type,
      amount,
      category,
      description,
      date: date || Date.now(),
      paymentMethod: paymentMethod || 'cash',
      recurring: recurring || false,
      recurringFrequency: recurring ? recurringFrequency : null,
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'Tranzaksiya yaratildi',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date, paymentMethod, recurring, recurringFrequency, tags } = req.body;

    const transaction = await Finance.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Tranzaksiya topilmadi'
      });
    }

    // Update fields
    if (type !== undefined) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (category !== undefined) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = new Date(date);
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (recurring !== undefined) transaction.recurring = recurring;
    if (recurringFrequency !== undefined) transaction.recurringFrequency = recurringFrequency;
    if (tags !== undefined) transaction.tags = tags;

    await transaction.save();

    res.json({
      success: true,
      message: 'Tranzaksiya yangilandi',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Tranzaksiya topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Tranzaksiya o\'chirildi'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Get financial statistics
exports.getStatistics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.userId;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch(period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get all transactions in period
    const transactions = await Finance.find({
      userId,
      date: { $gte: startDate, $lte: now }
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    // Category breakdown
    const categoryBreakdown = {};
    transactions.forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = {
          income: 0,
          expense: 0,
          count: 0
        };
      }
      
      if (t.type === 'income') {
        categoryBreakdown[t.category].income += t.amount;
      } else {
        categoryBreakdown[t.category].expense += t.amount;
      }
      
      categoryBreakdown[t.category].count++;
    });

    // Top expenses
    const expenseCategories = Object.entries(categoryBreakdown)
      .filter(([_, data]) => data.expense > 0)
      .sort((a, b) => b[1].expense - a[1].expense)
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        amount: data.expense,
        percentage: totalExpense > 0 ? ((data.expense / totalExpense) * 100).toFixed(1) : 0
      }));

    // Top income sources
    const incomeCategories = Object.entries(categoryBreakdown)
      .filter(([_, data]) => data.income > 0)
      .sort((a, b) => b[1].income - a[1].income)
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        amount: data.income,
        percentage: totalIncome > 0 ? ((data.income / totalIncome) * 100).toFixed(1) : 0
      }));

    const recentTransactions = await Finance.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    const dailyData = await Finance.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    res.json({
      success: true,
      period,
      stats: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate: totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0,
        transactionCount: transactions.length
      },
      categoryBreakdown,
      topExpenses: expenseCategories,
      topIncome: incomeCategories,
      recentTransactions,
      dailyTrend: dailyData
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.userId;

    const query = { userId };
    if (type) query.type = type;

    let categories = await FinanceCategory.find(query).sort({ name: 1 });

    // If no custom categories, return default ones
    if (categories.length === 0) {
      categories = await createDefaultCategories(userId);
    }

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color, budget } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Nom va tur kerak'
      });
    }

    const category = await FinanceCategory.create({
      userId: req.userId,
      name,
      type,
      icon: icon || 'DollarSign',
      color: color || '#FF6B35',
      budget: budget || 0
    });

    res.status(201).json({
      success: true,
      message: 'Kategoriya yaratildi',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Helper: Create default categories
async function createDefaultCategories(userId) {
  const defaultCategories = [
    // Income categories
    { name: 'Maosh', type: 'income', icon: 'Briefcase', color: '#10b981' },
    { name: 'Biznes', type: 'income', icon: 'TrendingUp', color: '#3b82f6' },
    { name: 'Investitsiya', type: 'income', icon: 'PieChart', color: '#8b5cf6' },
    { name: 'Boshqa kirim', type: 'income', icon: 'Plus', color: '#06b6d4' },
    
    // Expense categories
    { name: 'Oziq-ovqat', type: 'expense', icon: 'ShoppingCart', color: '#ef4444' },
    { name: 'Transport', type: 'expense', icon: 'Car', color: '#f59e0b' },
    { name: 'Uy-joy', type: 'expense', icon: 'Home', color: '#ec4899' },
    { name: 'Kommunal', type: 'expense', icon: 'Zap', color: '#14b8a6' },
    { name: 'Sog\'liq', type: 'expense', icon: 'Heart', color: '#f43f5e' },
    { name: 'Ta\'lim', type: 'expense', icon: 'BookOpen', color: '#6366f1' },
    { name: 'O\'yin-kulgi', type: 'expense', icon: 'Smile', color: '#a855f7' },
    { name: 'Kiyim', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
    { name: 'Boshqa xarajat', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' }
  ];

  const categories = await FinanceCategory.insertMany(
    defaultCategories.map(cat => ({ ...cat, userId, isDefault: true }))
  );

  return categories;
}

// Bulk delete transactions
exports.bulkDelete = async (req, res) => {
  try {
    const { transactionIds } = req.body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tranzaksiya ID lari kerak'
      });
    }

    const result = await Finance.deleteMany({
      _id: { $in: transactionIds },
      userId: req.userId
    });

    res.json({
      success: true,
      message: `${result.deletedCount} ta tranzaksiya o'chirildi`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};