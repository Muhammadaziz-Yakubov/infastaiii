const Goal = require('../models/Goal');

// Get all goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      goals: goals || []
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Create goal
exports.createGoal = async (req, res) => {
  try {
    const {
      name,
      description,
      targetAmount,
      currentAmount = 0,
      deadline,
      icon,
      color,
      status,
      priority,
      category
    } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Nomi, maqsad summasi va muddati majburiy'
      });
    }

    const goal = await Goal.create({
      userId: req.userId,
      name,
      description,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: new Date(deadline),
      icon: icon || 'Target',
      color: color || '#3B82F6',
      status: status || 'active',
      priority: priority || 'medium',
      category: category || 'personal',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Maqsad yaratildi',
      goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Maqsad topilmadi'
      });
    }

    const updates = req.body;
    
    // Update fields
    if (updates.name !== undefined) goal.name = updates.name;
    if (updates.description !== undefined) goal.description = updates.description;
    if (updates.targetAmount !== undefined) goal.targetAmount = parseFloat(updates.targetAmount);
    if (updates.currentAmount !== undefined) goal.currentAmount = parseFloat(updates.currentAmount);
    if (updates.deadline !== undefined) goal.deadline = new Date(updates.deadline);
    if (updates.icon !== undefined) goal.icon = updates.icon;
    if (updates.color !== undefined) goal.color = updates.color;
    if (updates.status !== undefined) goal.status = updates.status;
    if (updates.priority !== undefined) goal.priority = updates.priority;
    if (updates.category !== undefined) goal.category = updates.category;
    
    goal.updatedAt = Date.now();
    await goal.save();

    res.json({
      success: true,
      message: 'Maqsad yangilandi',
      goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Maqsad topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Maqsad o\'chirildi'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Fund goal
exports.fundGoal = async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Summa kiritilishi kerak'
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Maqsad topilmadi'
      });
    }

    // Update current amount
    goal.currentAmount += parseFloat(amount);
    goal.updatedAt = Date.now();
    await goal.save();

    // Add transaction record (you might want to create a separate transactions collection)
    res.json({
      success: true,
      message: 'Mablag\' ajratildi',
      goal,
      fundedAmount: amount
    });
  } catch (error) {
    console.error('Fund goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Update goal status
exports.updateGoalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Maqsad topilmadi'
      });
    }

    goal.status = status;
    goal.updatedAt = Date.now();
    await goal.save();

    res.json({
      success: true,
      message: 'Status yangilandi',
      goal
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};