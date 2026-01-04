// backend/src/routes/financeRoutes.js
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');
const debtRoutes = require('./debtRoutes');

// All routes need authentication
router.use(authMiddleware);

// Transaction CRUD
router.get('/transactions', financeController.getTransactions);
router.get('/transactions/:id', financeController.getTransaction);
router.post('/transactions', financeController.createTransaction);
router.put('/transactions/:id', financeController.updateTransaction);
router.delete('/transactions/:id', financeController.deleteTransaction);

// Statistics
router.get('/statistics', financeController.getStatistics);
// Debt routes
router.use('/', debtRoutes);
// Categories
router.get('/categories', financeController.getCategories);
router.post('/categories', financeController.createCategory);

// Bulk operations
router.post('/bulk-delete', financeController.bulkDelete);

module.exports = router;