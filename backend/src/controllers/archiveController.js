const Archive = require('../models/Archive');
const Task = require('../models/Task');

/**
 * GET ALL ARCHIVED TASKS
 */
exports.getArchives = async (req, res) => {
  try {
    const archives = await Archive.find({ userId: req.userId })
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      archives: archives || [],
      count: archives.length
    });
  } catch (err) {
    console.error('Get archives error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi',
      archives: []
    });
  }
};

/**
 * RESTORE ARCHIVED TASK → ACTIVE TASK
 */
exports.restoreArchive = async (req, res) => {
  try {
    const archive = await Archive.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!archive) {
      return res.status(404).json({
        success: false,
        message: 'Arxiv topilmadi'
      });
    }

    // Faol vazifaga qaytarish
    const restoredTask = await Task.create({
      userId: archive.userId,
      title: archive.title,
      description: archive.description || '',
      priority: archive.priority,
      deadline: archive.deadline,
      estimatedHours: archive.estimatedHours || 0,
      tags: archive.tags || [],
      status: 'pending' // Qaytarilganda pending bo'ladi
    });

    console.log('✅ Restored task:', restoredTask);

    // Arxivdan o'chirish
    await Archive.findByIdAndDelete(archive._id);
    console.log('✅ Deleted from archive:', archive._id);

    res.json({
      success: true,
      message: 'Task faol ro\'yxatga qaytarildi',
      task: restoredTask
    });
  } catch (err) {
    console.error('❌ Restore archive error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi: ' + err.message
    });
  }
};

/**
 * DELETE ARCHIVED TASK PERMANENTLY
 */
exports.deleteArchive = async (req, res) => {
  try {
    const archive = await Archive.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!archive) {
      return res.status(404).json({
        success: false,
        message: 'Arxiv topilmadi'
      });
    }

    console.log('✅ Permanently deleted archive:', archive._id);

    res.json({
      success: true,
      message: 'Arxiv butunlay o\'chirildi'
    });
  } catch (err) {
    console.error('❌ Delete archive error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi: ' + err.message
    });
  }
};

/**
 * GET ARCHIVE STATISTICS
 */
exports.getArchiveStats = async (req, res) => {
  try {
    const userId = req.userId;

    const total = await Archive.countDocuments({ userId });
    const completed = await Archive.countDocuments({ 
      userId, 
      status: 'completed' 
    });
    const archived = await Archive.countDocuments({ 
      userId, 
      status: 'archived' 
    });
    const cancelled = await Archive.countDocuments({ 
      userId, 
      status: 'cancelled' 
    });

    // Get archives from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentArchives = await Archive.countDocuments({
      userId,
      completedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        total,
        completed,
        archived,
        cancelled,
        recentArchives
      }
    });
  } catch (err) {
    console.error('❌ Get archive stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};