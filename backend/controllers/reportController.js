const Order = require('../models/Order');
const Expense = require('../models/Expense');
const { asyncHandler } = require('../middleware/errorHandler');
const { exportToExcel } = require('../utils/excelExport');
const path = require('path');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Today's stats
    const todayOrders = await Order.find({
        orderDate: { $gte: today }
    });

    const todayIncome = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const todayExpenses = await Expense.find({
        date: { $gte: today }
    });

    const todayExpenseTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // This month's stats
    const monthOrders = await Order.find({
        orderDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthIncome = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const monthExpenses = await Expense.find({
        date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // All time stats
    const allOrders = await Order.find();
    const allIncome = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalAdvanceReceived = allOrders.reduce((sum, order) => sum + order.advanceAmountPaid, 0);
    const totalBalanceReceived = allOrders.reduce((sum, order) => sum + order.balanceAmountReceived, 0);
    const totalPending = allOrders.reduce((sum, order) => sum + order.balance, 0);

    const allExpenses = await Expense.find();
    const allExpenseTotal = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Pending orders count
    const pendingOrdersCount = await Order.countDocuments({
        status: { $ne: 'Completed' }
    });

    // Upcoming trials (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTrials = await Order.find({
        trialDate: { $gte: today, $lte: nextWeek },
        status: { $ne: 'Completed' }
    }).sort('trialDate').limit(5);

    // Upcoming deliveries (next 7 days)
    const upcomingDeliveries = await Order.find({
        deliveryDate: { $gte: today, $lte: nextWeek },
        status: { $ne: 'Completed' }
    }).sort('deliveryDate').limit(5);

    // Recent orders
    const recentOrders = await Order.find()
        .sort('-createdAt')
        .limit(5)
        .populate('createdBy', 'fullName');

    // Status breakdown
    const statusBreakdown = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Custom stats if range provided
    let customStats = null;
    const { startDate, endDate } = req.query;

    if (startDate || endDate) {
        try {
            const query = {};
            query.orderDate = {};
            if (startDate && startDate !== 'undefined') query.orderDate.$gte = new Date(startDate);
            if (endDate && endDate !== 'undefined') query.orderDate.$lte = new Date(endDate);
            // Safety cleanup
            if (Object.keys(query.orderDate).length === 0) delete query.orderDate;

            const customOrders = await Order.find(query);
            const customIncome = customOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            const customAdvance = customOrders.reduce((sum, order) => sum + order.advanceAmountPaid, 0);
            const customBalanceRecd = customOrders.reduce((sum, order) => sum + order.balanceAmountReceived, 0);
            const customPending = customOrders.reduce((sum, order) => sum + order.balance, 0);

            const expenseQuery = {};
            if (startDate || endDate) {
                expenseQuery.date = {};
                if (startDate && startDate !== 'undefined') expenseQuery.date.$gte = new Date(startDate);
                if (endDate && endDate !== 'undefined') expenseQuery.date.$lte = new Date(endDate);
                if (Object.keys(expenseQuery.date).length === 0) delete expenseQuery.date;
            }
            const customExpenses = await Expense.find(expenseQuery);
            const customExpenseTotal = customExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            // Status counts for custom range
            const readyForTrialCount = customOrders.filter(o => o.status === 'Ready for Trial').length;
            const pendingCount = customOrders.filter(o => o.status === 'Pending').length;
            const inProgressCount = customOrders.filter(o => o.status === 'In Progress').length;

            customStats = {
                income: customIncome,
                advance: customAdvance,
                balanceRecd: customBalanceRecd,
                pendingAmount: customPending,
                expenses: customExpenseTotal,
                profit: customIncome - customExpenseTotal,
                ordersCount: customOrders.length,
                readyForTrial: readyForTrialCount,
                completed: customOrders.filter(o => o.status === 'Completed').length,
                pending: pendingCount,
                inProgress: inProgressCount
            };
        } catch (err) {
            console.error('Error calculating custom stats:', err);
            // Continue without custom stats rather than crashing
        }
    }

    res.status(200).json({
        success: true,
        data: {
            custom: customStats, // Add custom stats
            today: {
                income: todayIncome,
                expenses: todayExpenseTotal,
                profit: todayIncome - todayExpenseTotal,
                ordersCount: todayOrders.length
            },
            thisMonth: {
                income: monthIncome,
                expenses: monthExpenseTotal,
                profit: monthIncome - monthExpenseTotal,
                ordersCount: monthOrders.length,
                advance: monthOrders.reduce((sum, o) => sum + o.advanceAmountPaid, 0),
                balanceRecd: monthOrders.reduce((sum, o) => sum + o.balanceAmountReceived, 0),
                pending: monthOrders.reduce((sum, o) => sum + o.balance, 0)
            },
            allTime: {
                income: allIncome,
                expenses: allExpenseTotal,
                profit: allIncome - allExpenseTotal,
                ordersCount: allOrders.length,
                advanceReceived: totalAdvanceReceived,
                balanceReceived: totalBalanceReceived,
                pendingAmount: totalPending
            },
            pendingOrdersCount,
            upcomingTrials,
            upcomingDeliveries,
            recentOrders,
            statusBreakdown
        }
    });
});

// @desc    Get daily sales report
// @route   GET /api/reports/daily-sales
// @access  Private
exports.getDailySalesReport = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
        matchStage.orderDate = {};
        if (startDate) matchStage.orderDate.$gte = new Date(startDate);
        if (endDate) matchStage.orderDate.$lte = new Date(endDate);
    }

    const dailySales = await Order.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$orderDate' }
                },
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                totalAdvance: { $sum: '$advanceAmountPaid' },
                totalBalanceReceived: { $sum: '$balanceAmountReceived' },
                totalPending: { $sum: '$balance' }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
        success: true,
        count: dailySales.length,
        data: dailySales
    });
});

// @desc    Get pending orders report
// @route   GET /api/reports/pending-orders
// @access  Private
exports.getPendingOrdersReport = asyncHandler(async (req, res, next) => {
    const pendingOrders = await Order.find({
        status: { $ne: 'Completed' }
    })
        .populate('createdBy', 'fullName')
        .sort('deliveryDate');

    const summary = {
        totalPendingOrders: pendingOrders.length,
        totalPendingAmount: pendingOrders.reduce((sum, order) => sum + order.balance, 0),
        byStatus: {}
    };

    // Group by status
    pendingOrders.forEach(order => {
        if (!summary.byStatus[order.status]) {
            summary.byStatus[order.status] = {
                count: 0,
                totalAmount: 0
            };
        }
        summary.byStatus[order.status].count++;
        summary.byStatus[order.status].totalAmount += order.balance;
    });

    res.status(200).json({
        success: true,
        summary,
        data: pendingOrders
    });
});

// @desc    Get payment status report
// @route   GET /api/reports/payment-status
// @access  Private
exports.getPaymentStatusReport = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
        matchStage.orderDate = {};
        if (startDate) matchStage.orderDate.$gte = new Date(startDate);
        if (endDate) matchStage.orderDate.$lte = new Date(endDate);
    }

    const orders = await Order.find(matchStage)
        .populate('createdBy', 'fullName')
        .sort('-orderDate');

    // Categorize by payment status
    const paid = orders.filter(o => o.balance === 0);
    const unpaid = orders.filter(o => o.advanceAmountPaid === 0 && o.balanceAmountReceived === 0);
    const partial = orders.filter(o =>
        (o.advanceAmountPaid > 0 || o.balanceAmountReceived > 0) && o.balance > 0
    );

    const summary = {
        total: orders.length,
        paid: {
            count: paid.length,
            amount: paid.reduce((sum, o) => sum + o.totalAmount, 0)
        },
        unpaid: {
            count: unpaid.length,
            amount: unpaid.reduce((sum, o) => sum + o.totalAmount, 0)
        },
        partial: {
            count: partial.length,
            totalAmount: partial.reduce((sum, o) => sum + o.totalAmount, 0),
            received: partial.reduce((sum, o) => sum + o.advanceAmountPaid + o.balanceAmountReceived, 0),
            pending: partial.reduce((sum, o) => sum + o.balance, 0)
        }
    };

    res.status(200).json({
        success: true,
        summary,
        data: {
            paid,
            unpaid,
            partial
        }
    });
});

// @desc    Export report to CSV
// @route   POST /api/reports/export
// @access  Private
exports.exportReport = asyncHandler(async (req, res, next) => {
    // Check query params first (for GET request) then body
    const { startDate, endDate, status, category } = req.query.startDate ? req.query : req.body;
    const includeExpenses = req.query.includeExpenses === 'true' || req.body.includeExpenses;

    // Build query
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
        query.orderDate = {};
        if (startDate) query.orderDate.$gte = new Date(startDate);
        if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    // Get orders
    const orders = await Order.find(query).sort('-orderDate');

    // Get expenses if requested
    let expenses = [];
    if (includeExpenses) {
        let expenseQuery = {};
        if (startDate || endDate) {
            expenseQuery.date = {};
            if (startDate) expenseQuery.date.$gte = new Date(startDate);
            if (endDate) expenseQuery.date.$lte = new Date(endDate);
        }
        expenses = await Expense.find(expenseQuery);
    }

    // Generate CSV content
    let csv = '';

    // Orders CSV
    csv += 'ORDERS REPORT\n';
    csv += 'Order No,Book No,Customer Name,Phone,Category,Order Date,Trial Date,Delivery Date,Amount,Advance,Balance Received,Pending,Status\n';

    orders.forEach(order => {
        csv += `${order.orderNo || ''},`;
        csv += `${order.orderNoFromBook || ''},`;
        csv += `"${order.customerName || ''}",`;
        csv += `${order.phoneNumber || ''},`;
        csv += `${order.category || ''},`;
        csv += `${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : ''},`;
        csv += `${order.trialDate ? new Date(order.trialDate).toLocaleDateString('en-IN') : ''},`;
        csv += `${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN') : ''},`;
        csv += `${order.totalAmount || 0},`;
        csv += `${order.advanceAmountPaid || 0},`;
        csv += `${order.balanceAmountReceived || 0},`;
        csv += `${order.balance || 0},`;
        csv += `${order.status || ''}\n`;
    });

    // Add totals
    const totalIncome = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalAdvance = orders.reduce((sum, o) => sum + (o.advanceAmountPaid || 0), 0);
    const totalBalanceRecd = orders.reduce((sum, o) => sum + (o.balanceAmountReceived || 0), 0);
    const totalPending = orders.reduce((sum, o) => sum + (o.balance || 0), 0);

    csv += `TOTALS,,,,,,,${totalIncome},${totalAdvance},${totalBalanceRecd},${totalPending},\n\n`;

    // Expenses CSV
    if (includeExpenses && expenses.length > 0) {
        csv += '\nEXPENSES REPORT\n';
        csv += 'Date,Category,Description,Amount\n';

        expenses.forEach(exp => {
            csv += `${exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : ''},`;
            csv += `${exp.category || ''},`;
            csv += `"${exp.description || ''}",`;
            csv += `${exp.amount || 0}\n`;
        });

        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        csv += `TOTAL,,,${totalExpenses}\n`;
    }

    // Set headers for CSV download
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `MomAndMe_Report_${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send CSV
    res.send(csv);
});

// @desc    Get custom report
// @route   POST /api/reports/custom
// @access  Private
exports.getCustomReport = asyncHandler(async (req, res, next) => {
    const {
        startDate,
        endDate,
        status,
        category,
        paymentStatus,
        groupBy = 'date' // date, category, status
    } = req.body;

    // Build query
    let matchStage = {};

    if (status) matchStage.status = status;
    if (category) matchStage.category = category;
    if (startDate || endDate) {
        matchStage.orderDate = {};
        if (startDate) matchStage.orderDate.$gte = new Date(startDate);
        if (endDate) matchStage.orderDate.$lte = new Date(endDate);
    }

    // Payment status filter
    if (paymentStatus === 'Paid') {
        matchStage.balance = 0;
    } else if (paymentStatus === 'Unpaid') {
        matchStage.advanceAmountPaid = 0;
        matchStage.balanceAmountReceived = 0;
    } else if (paymentStatus === 'Partial') {
        matchStage.balance = { $gt: 0 };
    }

    // Group by field
    let groupId;
    if (groupBy === 'category') {
        groupId = '$category';
    } else if (groupBy === 'status') {
        groupId = '$status';
    } else {
        groupId = { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } };
    }

    const report = await Order.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: groupId,
                count: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                totalAdvance: { $sum: '$advanceAmountPaid' },
                totalBalanceReceived: { $sum: '$balanceAmountReceived' },
                totalPending: { $sum: '$balance' }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
        success: true,
        groupBy,
        count: report.length,
        data: report
    });
});
