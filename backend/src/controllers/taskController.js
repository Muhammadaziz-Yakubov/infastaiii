const Task = require('../models/Task');
const Archive = require('../models/Archive');

/**
 * GET ALL TASKS (ACTIVE)
 */
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * CREATE TASK
 */
exports.createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      deadline, 
      estimatedHours,
      tags
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Vazifa nomi kerak'
      });
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      description,
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : null,
      estimatedHours: estimatedHours || 0,
      tags: tags || [],
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      task
    });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * UPDATE TASK
 */
exports.updateTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      deadline, 
      status, 
      estimatedHours,
      tags
    } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task topilmadi'
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (deadline !== undefined)
      task.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) task.status = status;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    res.json({
      success: true,
      task
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// Task search
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        tasks: []
      });
    }

    const tasks = await Task.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ],
      userId: req.userId
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title description status createdAt updatedAt');

    res.json({
      success: true,
      tasks
    });
  } catch (err) {
    console.error('Search tasks error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * COMPLETE TASK → ARCHIVE
 */
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task topilmadi'
      });
    }

    // Arxivga saqlash
    const archivedTask = await Archive.create({
      userId: task.userId,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline,
      estimatedHours: task.estimatedHours || 0,
      tags: task.tags || [],
      status: 'completed',
      completedAt: new Date(),
      archivedAt: new Date(),
      category: 'task',
      difficulty: 5 // Default difficulty
    });

    console.log('Arxivga saqlandi:', archivedTask);

    // Faol vazifadan o'chirish
    await Task.findByIdAndDelete(task._id);

    res.json({
      success: true,
      message: 'Task archive ga ko‘chirildi',
      archive: archivedTask
    });
  } catch (err) {
    console.error('Complete task error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * DELETE TASK (ACTIVE)
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task topilmadi'
      });
    }

    res.json({
      success: true,
      message: 'Task ochirildi'
    });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};