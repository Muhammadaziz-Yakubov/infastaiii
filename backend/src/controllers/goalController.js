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
      goalType = 'financial',
      targetAmount,
      currentAmount = 0,
      deadline,
      icon,
      color,
      status,
      priority,
      category,
      tracking
    } = req.body;

    if (!name || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Nomi va muddati majburiy'
      });
    }

    if (goalType === 'financial' && !targetAmount) {
      return res.status(400).json({
        success: false,
        message: 'Moliyaviy maqsad uchun summa majburiy'
      });
    }

    const goalData = {
      userId: req.userId,
      name,
      description,
      goalType,
      deadline: new Date(deadline),
      icon: icon || 'Target',
      color: color || '#3B82F6',
      status: status || 'active',
      priority: priority || 'medium',
      category: category || 'personal',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (goalType === 'financial') {
      goalData.targetAmount = parseFloat(targetAmount);
      goalData.currentAmount = parseFloat(currentAmount) || 0;
    }

    if (goalType === 'non-financial' && tracking) {
      goalData.tracking = tracking;
    }

    const goal = await Goal.create(goalData);

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

// Add daily check
exports.addDailyCheck = async (req, res) => {
  try {
    const { date, completed, note } = req.body;
    
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

    if (goal.goalType !== 'non-financial') {
      return res.status(400).json({
        success: false,
        message: 'Bu funksiya faqat moliyasiz maqsadlar uchun'
      });
    }

    if (!goal.tracking) {
      goal.tracking = {
        totalDays: 0,
        completedDays: 0,
        dailyChecks: [],
        steps: []
      };
    }

    const checkDate = date ? new Date(date) : new Date();
    checkDate.setHours(0, 0, 0, 0);

    const existingCheck = goal.tracking.dailyChecks.find(
      check => new Date(check.date).setHours(0, 0, 0, 0) === checkDate.getTime()
    );

    if (existingCheck) {
      existingCheck.completed = completed !== undefined ? completed : true;
      existingCheck.note = note || '';
    } else {
      goal.tracking.dailyChecks.push({
        date: checkDate,
        completed: completed !== undefined ? completed : true,
        note: note || ''
      });
    }

    goal.tracking.completedDays = goal.tracking.dailyChecks.filter(c => c.completed).length;
    goal.updatedAt = Date.now();
    await goal.save();

    res.json({
      success: true,
      message: 'Kunlik belgi qo\'shildi',
      goal
    });
  } catch (error) {
    console.error('Add daily check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Add step
exports.addStep = async (req, res) => {
  try {
    const { title, description, order } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Step nomi majburiy'
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

    if (goal.goalType !== 'non-financial') {
      return res.status(400).json({
        success: false,
        message: 'Bu funksiya faqat moliyasiz maqsadlar uchun'
      });
    }

    if (!goal.tracking) {
      goal.tracking = {
        totalDays: 0,
        completedDays: 0,
        dailyChecks: [],
        steps: []
      };
    }

    goal.tracking.steps.push({
      title,
      description: description || '',
      completed: false,
      order: order !== undefined ? order : goal.tracking.steps.length
    });

    goal.updatedAt = Date.now();
    await goal.save();

    res.json({
      success: true,
      message: 'Step qo\'shildi',
      goal
    });
  } catch (error) {
    console.error('Add step error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Update step
exports.updateStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { title, description, completed, order } = req.body;
    
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

    const step = goal.tracking?.steps?.id(stepId);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step topilmadi'
      });
    }

    if (title !== undefined) step.title = title;
    if (description !== undefined) step.description = description;
    if (completed !== undefined) {
      step.completed = completed;
      step.completedAt = completed ? new Date() : null;
    }
    if (order !== undefined) step.order = order;

    goal.updatedAt = Date.now();
    await goal.save();

    res.json({
      success: true,
      message: 'Step yangilandi',
      goal
    });
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Delete step
exports.deleteStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    
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

    if (!goal.tracking?.steps) {
      return res.status(404).json({
        success: false,
        message: 'Steps topilmadi'
      });
    }

    goal.tracking.steps = goal.tracking.steps.filter(
      step => step._id.toString() !== stepId
    );

    goal.updatedAt = Date.now();
    await goal.save();

    res.json({
      success: true,
      message: 'Step o\'chirildi',
      goal
    });
  } catch (error) {
    console.error('Delete step error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};