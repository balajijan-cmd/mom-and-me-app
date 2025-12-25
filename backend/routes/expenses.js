const express = require('express');
const router = express.Router();
const {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats,
    getMonthlyExpenses
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats routes (must be before /:id)
router.get('/stats', getExpenseStats);
router.get('/monthly', getMonthlyExpenses);

// Main CRUD routes
router.route('/')
    .get(getExpenses)
    .post(createExpense);

router.route('/:id')
    .get(getExpense)
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;
