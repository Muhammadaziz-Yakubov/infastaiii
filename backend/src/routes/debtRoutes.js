const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes need authentication
router.use(authMiddleware);

// Debt CRUD operations
router.get('/debts', debtController.getDebts);
router.get('/debts/:id', debtController.getDebt);
router.post('/debts', debtController.createDebt);
router.put('/debts/:id', debtController.updateDebt);
router.delete('/debts/:id', debtController.deleteDebt);

// Debt payments
router.post('/debts/:id/payments', debtController.addPayment);
router.put('/debts/:id/extend', debtController.extendDueDate);

// Debt statistics
router.get('/debts/statistics', debtController.getDebtStatistics);

module.exports = router;