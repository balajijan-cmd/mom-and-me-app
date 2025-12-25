const Expense = require('../models/Expense');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all expenses with pagination and filters
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        category,
        sortBy = '-date'
    } = req.query;

    // Build query
    let query = {};

    // Filter by date range
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const expenses = await Expense.find(query)
        .populate('createdBy', 'fullName username')
        .sort(sortBy)
        .limit(parseInt(limit))
        .skip(skip);

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    res.status(200).json({
        success: true,
        count: expenses.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: expenses
    });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res, next) => {
    const expense = await Expense.findById(req.params.id)
        .populate('createdBy', 'fullName username');

    if (!expense) {
        return res.status(404).json({
            success: false,
            message: 'Expense not found'
        });
    }

    res.status(200).json({
        success: true,
        data: expense
    });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res, next) => {
    // Add user to request body
    req.body.createdBy = req.user.id;

    const expense = await Expense.create(req.body);

    res.status(201).json({
        success: true,
        data: expense
    });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res, next) => {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
        return res.status(404).json({
            success: false,
            message: 'Expense not found'
        });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: expense
    });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res, next) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        return res.status(404).json({
            success: false,
            message: 'Expense not found'
        });
    }

    await expense.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Expense deleted successfully'
    });
});

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
exports.getExpenseStats = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Expense.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalExpenses: { $sum: '$amount' },
                count: { $sum: 1 },
                avgExpense: { $avg: '$amount' }
            }
        }
    ]);

    const byCategory = await Expense.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            overall: stats[0] || { totalExpenses: 0, count: 0, avgExpense: 0 },
            byCategory
        }
    });
});

// @desc    Get monthly expense summary
// @route   GET /api/expenses/monthly
// @access  Private
exports.getMonthlyExpenses = asyncHandler(async (req, res, next) => {
    const { year = new Date().getFullYear() } = req.query;

    const expenses = await Expense.aggregate([
        {
            $match: {
                date: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$date' },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Format response with month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formattedExpenses = expenses.map(exp => ({
        month: monthNames[exp._id - 1],
        monthNumber: exp._id,
        total: exp.total,
        count: exp.count
    }));

    res.status(200).json({
        success: true,
        year: parseInt(year),
        data: formattedExpenses
    });
});
