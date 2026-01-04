const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Task routes
router.get('/', taskController.getTasks); // GET /api/tasks
router.get('/search', taskController.searchTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Action routes
router.post('/:id/complete', taskController.completeTask); // POST /api/tasks/:id/complete

module.exports = router;