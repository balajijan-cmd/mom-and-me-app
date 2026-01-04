const { db } = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');

const ordersColl = db.collection('orders');
const expensesColl = db.collection('expenses');

// Helper to fetch all docs in a collection (with optional date filtering if we indexed it, but let's do memory for flexibility in this migration)
const fetchAll = async (coll) => {
    const snap = await coll.get();
    const items = [];
    snap.forEach(doc => items.push({ ...doc.data(), _id: doc.id, id: doc.id }));
    return items;
};

// @desc    Get dashboard statistics
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const orders = await fetchAll(ordersColl);
    const expenses = await fetchAll(expensesColl);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Process Orders
    let todayOrders = [], monthOrders = [];
    orders.forEach(o => {
        const d = new Date(o.createdAt || o.orderDate); // Handle both fields just in case
        if (d >= today) todayOrders.push(o);
        if (d >= startOfMonth) monthOrders.push(o);
    });

    const sum = (arr, field) => arr.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);

    const todayStats = {
        income: sum(todayOrders, 'totalAmount'),
        expenses: 0,
        ordersCount: todayOrders.length
    };

    const monthStats = {
        income: sum(monthOrders, 'totalAmount'),
        expenses: 0,
        ordersCount: monthOrders.length,
        advance: sum(monthOrders, 'advanceAmountPaid'),
        balanceRecd: sum(monthOrders, 'balanceAmountReceived'),
        pending: sum(monthOrders, 'balance')
    };

    // Process Expenses
    expenses.forEach(e => {
        const d = new Date(e.date);
        if (d >= today) todayStats.expenses += (Number(e.amount) || 0);
        if (d >= startOfMonth) monthStats.expenses += (Number(e.amount) || 0);
    });

    todayStats.profit = todayStats.income - todayStats.expenses;
    monthStats.profit = monthStats.income - monthStats.expenses;

    // All Time
    const allTime = {
        income: sum(orders, 'totalAmount'),
        expenses: sum(expenses, 'amount'),
        ordersCount: orders.length,
        advanceReceived: sum(orders, 'advanceAmountPaid'),
        balanceReceived: sum(orders, 'balanceAmountReceived'),
        pendingAmount: sum(orders, 'balance')
    };
    allTime.profit = allTime.income - allTime.expenses;

    // Upcoming
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTrials = orders
        .filter(o => o.status !== 'Completed' && o.trialDate && new Date(o.trialDate) >= today && new Date(o.trialDate) <= nextWeek)
        .sort((a, b) => new Date(a.trialDate) - new Date(b.trialDate))
        .slice(0, 5);

    const upcomingDeliveries = orders
        .filter(o => o.status !== 'Completed' && o.deliveryDate && new Date(o.deliveryDate) >= today && new Date(o.deliveryDate) <= nextWeek)
        .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
        .slice(0, 5);

    // Recent
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
        .slice(0, 5);

    // Custom Stats
    let customStats = null;
    const { startDate, endDate } = req.query;
    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date(8640000000000000);

        const customOrders = orders.filter(o => {
            const d = new Date(o.orderDate || o.createdAt);
            return d >= start && d <= end;
        });
        const customExp = expenses.filter(e => {
            const d = new Date(e.date);
            return d >= start && d <= end;
        });

        const cIncome = sum(customOrders, 'totalAmount');
        const cExp = sum(customExp, 'amount');

        customStats = {
            income: cIncome,
            expenses: cExp,
            profit: cIncome - cExp,
            ordersCount: customOrders.length,
            pending: customOrders.filter(o => o.status === 'Pending').length,
            readyForTrial: customOrders.filter(o => o.status === 'Ready for Trial').length,
            completed: customOrders.filter(o => o.status === 'Completed').length
        };
    }

    res.status(200).json({
        success: true,
        data: {
            custom: customStats,
            today: todayStats,
            thisMonth: monthStats,
            allTime,
            upcomingTrials,
            upcomingDeliveries,
            recentOrders,
            pendingOrdersCount: orders.filter(o => o.status !== 'Completed').length
        }
    });
});

// @desc    Export report to CSV
exports.exportReport = asyncHandler(async (req, res, next) => {
    // Basic CSV writer from raw data to buffer response
    const { startDate, endDate, status, category } = req.query.startDate ? req.query : req.body;
    const includeExpenses = req.query.includeExpenses === 'true' || req.body.includeExpenses;

    const orders = await fetchAll(ordersColl);
    let filteredOrders = orders;

    // Filters
    if (status) filteredOrders = filteredOrders.filter(o => o.status === status);
    if (category) filteredOrders = filteredOrders.filter(o => o.category === category);
    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date(8640000000000000);
        filteredOrders = filteredOrders.filter(o => {
            const d = new Date(o.orderDate || o.createdAt);
            return d >= start && d <= end;
        });
    }

    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // CSV Construction
    let csv = 'ORDERS REPORT\n';
    csv += 'Order No,Book No,Customer Name,Phone,Category,Order Date,Trial Date,Delivery Date,Amount,Advance,Balance Received,Pending,Status\n';

    filteredOrders.forEach(o => {
        csv += `${o.orderNo || ''},${o.orderNoFromBook || ''},"${o.customerName || ''}",${o.phoneNumber || ''},${o.category || ''},`;
        csv += `${o.orderDate ? o.orderDate.split('T')[0] : ''},${o.trialDate ? o.trialDate.split('T')[0] : ''},${o.deliveryDate ? o.deliveryDate.split('T')[0] : ''},`;
        csv += `${o.totalAmount || 0},${o.advanceAmountPaid || 0},${o.balanceAmountReceived || 0},${o.balance || 0},${o.status}\n`;
    });

    if (includeExpenses) {
        const expenses = await fetchAll(expensesColl);
        // Filter expenses similarly if needed, for brevity assuming full dump or range match
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date(8640000000000000);
        const filteredExp = expenses.filter(e => {
            const d = new Date(e.date);
            return d >= start && d <= end;
        });

        csv += '\nEXPENSES REPORT\nDate,Category,Description,Amount\n';
        filteredExp.forEach(e => {
            csv += `${e.date ? e.date.split('T')[0] : ''},${e.category},"${e.description}",${e.amount}\n`;
        });
    }

    const filename = `Report_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
});

// Stubs for less critical reports to avoid 404s
exports.getDailySalesReport = asyncHandler(async (req, res) => res.json({ success: true, data: [] }));
exports.getPendingOrdersReport = asyncHandler(async (req, res) => res.json({ success: true, data: [] }));
exports.getPaymentStatusReport = asyncHandler(async (req, res) => res.json({ success: true, data: {} }));
exports.getCustomReport = asyncHandler(async (req, res) => res.json({ success: true, data: [] }));

