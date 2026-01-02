const Debt = require('../models/Debt');
const mongoose = require('mongoose');

// Get all debts with filters
exports.getDebts = async (req, res) => {
  try {
    const { type, status, sort, search } = req.query;
    const userId = req.userId;

    // Build query
    const query = { userId };
    
    if (type) query.type = type;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { personName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { personPhone: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortObj = { dueDate: 1 }; // Default: soonest due first
    if (sort === 'amount-high') sortObj = { amount: -1 };
    else if (sort === 'amount-low') sortObj = { amount: 1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };

    const debts = await Debt.find(query).sort(sortObj);

    res.json({
      success: true,
      count: debts.length,
      debts
    });
  } catch (error) {
    console.error('Get debts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Get single debt
exports.getDebt = async (req, res) => {
  try {
    // "statistics" so'rovi uchun tekshirish
    if (req.params.id === 'statistics') {
      return exports.getDebtStatistics(req, res);
    }

    // ObjectId validatsiyasi
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati'
      });
    }

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Qarz topilmadi'
      });
    }

    res.json({
      success: true,
      debt
    });
  } catch (error) {
    console.error('Get debt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Create debt
exports.createDebt = async (req, res) => {
  try {
    const {
      type,
      personName,
      personPhone,
      amount,
      description,
      dueDate,
      isRecurring,
      recurringFrequency,
      tags,
      notifications
    } = req.body;

    // Validation
    if (!type || !personName || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Tur, shaxs nomi, summa va muddat kerak'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Summa 0 dan katta bo\'lishi kerak'
      });
    }

    // Create debt
    const debt = await Debt.create({
      userId: req.userId,
      type,
      personName,
      personPhone: personPhone || '',
      amount: parseFloat(amount),
      remainingAmount: parseFloat(amount),
      description: description || '',
      dueDate: new Date(dueDate),
      originalDueDate: new Date(dueDate),
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      tags: tags || [],
      notifications: notifications || {
        beforeDue: { enabled: true, daysBefore: 3 },
        onDue: { enabled: true },
        overdue: { enabled: true, daysInterval: 1 }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Qarz yaratildi',
      debt
    });
  } catch (error) {
    console.error('Create debt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Update debt
exports.updateDebt = async (req, res) => {
  try {
    // ObjectId validatsiyasi
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati'
      });
    }

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Qarz topilmadi'
      });
    }

    const updates = req.body;
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'payment' && key !== '_id') {
        debt[key] = updates[key];
      }
    });

    await debt.save();

    res.json({
      success: true,
      message: 'Qarz yangilandi',
      debt
    });
  } catch (error) {
    console.error('Update debt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Add payment to debt
exports.addPayment = async (req, res) => {
  try {
    // ObjectId validatsiyasi
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati'
      });
    }

    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'To\'lov summasi noto\'g\'ri'
      });
    }

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Qarz topilmadi'
      });
    }

    if (parseFloat(amount) > debt.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: 'To\'lov summasi qolgan miqdordan ko\'p'
      });
    }

    // Add payment to history
    debt.paymentHistory.push({
      amount: parseFloat(amount),
      description: description || 'To\'lov',
      paymentDate: new Date()
    });

    // Update remaining amount
    debt.remainingAmount -= parseFloat(amount);
    
    // If fully paid, mark as completed
    if (debt.remainingAmount <= 0) {
      debt.status = 'completed';
    }

    await debt.save();

    res.json({
      success: true,
      message: 'To\'lov qo\'shildi',
      debt
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Delete debt
exports.deleteDebt = async (req, res) => {
  try {
    // ObjectId validatsiyasi
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati'
      });
    }

    const debt = await Debt.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Qarz topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Qarz o\'chirildi'
    });
  } catch (error) {
    console.error('Delete debt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Get debt statistics
exports.getDebtStatistics = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Faol qarzlar (to'lanmagan)
    const activeDebts = await Debt.find({
      userId,
      remainingAmount: { $gt: 0 }
    });

    let totalBorrowed = 0;
    let totalLent = 0;
    let activeBorrowed = 0;
    let activeLent = 0;
    let overdueBorrowed = 0;
    let overdueLent = 0;
    
    activeDebts.forEach(debt => {
      if (debt.type === 'borrow') {
        totalBorrowed += debt.amount;
        activeBorrowed += debt.remainingAmount;
        if (debt.status === 'overdue') overdueBorrowed += debt.remainingAmount;
      } else {
        totalLent += debt.amount;
        activeLent += debt.remainingAmount;
        if (debt.status === 'overdue') overdueLent += debt.remainingAmount;
      }
    });
    
    const netDebt = activeLent - activeBorrowed; // Ijobiy: berilgan qarz ko'p, manfiy: olingan qarz ko'p

    // Get upcoming debts (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingDebts = await Debt.find({
      userId,
      dueDate: { $gte: new Date(), $lte: nextWeek },
      status: 'active'
    }).sort({ dueDate: 1 }).limit(5);
    
    // Get overdue debts
    const overdueDebts = await Debt.find({
      userId,
      status: 'overdue'
    }).sort({ dueDate: 1 }).limit(5);

    res.json({
      success: true,
      summary: {
        totalBorrowed,
        totalLent,
        activeBorrowed,
        activeLent,
        overdueBorrowed,
        overdueLent,
        netDebt
      },
      upcomingDebts,
      overdueDebts
    });
  } catch (error) {
    console.error('Get debt statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Extend debt due date
exports.extendDueDate = async (req, res) => {
  try {
    // ObjectId validatsiyasi
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri ID formati'
      });
    }

    const { newDueDate, reason } = req.body;
    
    if (!newDueDate) {
      return res.status(400).json({
        success: false,
        message: 'Yangi muddat kerak'
      });
    }

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Qarz topilmadi'
      });
    }

    // Save old due date and update
    debt.originalDueDate = debt.dueDate;
    debt.dueDate = new Date(newDueDate);
    debt.status = 'active'; // Reset status if it was overdue
    
    // Add to payment history as note
    debt.paymentHistory.push({
      amount: 0,
      description: `Muddat uzaytirildi: ${reason || 'Sababsiz'}`,
      paymentDate: new Date()
    });

    await debt.save();

    res.json({
      success: true,
      message: 'Muddat uzaytirildi',
      debt
    });
  } catch (error) {
    console.error('Extend due date error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};