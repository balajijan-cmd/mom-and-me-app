const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Public
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/transactions
// @desc    Add a transaction
// @access  Public
router.post('/', async (req, res) => {
    const { type, amount, category, date, description } = req.body;

    try {
        const newTransaction = new Transaction({
            type,
            amount,
            category,
            date,
            description
        });

        const transaction = await newTransaction.save();
        res.json(transaction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        await transaction.remove();
        res.json({ message: 'Transaction removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/reports
// @desc    Get income/expense report
// @access  Public
router.get('/reports', async (req, res) => {
    try {
        const income = await Transaction.aggregate([
            { $match: { type: 'income' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const expense = await Transaction.aggregate([
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({
            totalIncome: income[0] ? income[0].total : 0,
            totalExpense: expense[0] ? expense[0].total : 0,
            balance: (income[0] ? income[0].total : 0) - (expense[0] ? expense[0].total : 0)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
