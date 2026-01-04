const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const archiveController = require('../controllers/archiveController');

// All routes require authentication
router.use(protect);

// GET /api/archive - Get all archives
router.get('/', archiveController.getArchives);

// GET /api/archive/stats - Get archive statistics
router.get('/stats', archiveController.getArchiveStats);

// POST /api/archive/:id/restore - Restore archive to active tasks
router.post('/:id/restore', archiveController.restoreArchive);

// DELETE /api/archive/:id - Delete archive permanently
router.delete('/:id', archiveController.deleteArchive);

module.exports = router;