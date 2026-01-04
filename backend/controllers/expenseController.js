const { db } = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');

const expensesColl = db.collection('expenses');

// @desc    Get all expenses
// @route   GET /api/expenses
exports.getExpenses = asyncHandler(async (req, res, next) => {
    let query = expensesColl;
    const { startDate, endDate, category, sortBy = '-date' } = req.query;

    if (category) query = query.where('category', '==', category);

    // Date filtering: In Firestore, we should store date as ISO strings or timestamps. 
    // Assuming ISO strings in 'date' field.
    if (startDate) query = query.where('date', '>=', startDate);
    if (endDate) query = query.where('date', '<=', endDate);

    const snapshot = await query.get();
    let expenses = [];
    snapshot.forEach(doc => expenses.push({ ...doc.data(), _id: doc.id, id: doc.id }));

    // Apply sorting in memory
    const desc = sortBy.startsWith('-');
    const field = sortBy.replace('-', '');

    expenses.sort((a, b) => {
        const valA = a[field] || '';
        const valB = b[field] || '';
        if (valA < valB) return desc ? 1 : -1;
        if (valA > valB) return desc ? -1 : 1;
        return 0;
    });

    res.status(200).json({ success: true, count: expenses.length, data: expenses });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
exports.getExpense = asyncHandler(async (req, res, next) => {
    const doc = await expensesColl.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: { ...doc.data(), _id: doc.id, id: doc.id } });
});

// @desc    Create expense
// @route   POST /api/expenses
exports.createExpense = asyncHandler(async (req, res, next) => {
    const newExpense = {
        ...req.body,
        createdBy: req.user.id,
        createdAt: new Date().toISOString()
    };
    const docRef = await expensesColl.add(newExpense);
    res.status(201).json({ success: true, data: { ...newExpense, _id: docRef.id, id: docRef.id } });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = asyncHandler(async (req, res, next) => {
    const docRef = expensesColl.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Not found' });

    await docRef.update(req.body);
    const updated = await docRef.get();
    res.status(200).json({ success: true, data: { ...updated.data(), _id: updated.id, id: updated.id } });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = asyncHandler(async (req, res, next) => {
    await expensesColl.doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'Deleted' });
});

// @desc    Get expense statistics
exports.getExpenseStats = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    let query = expensesColl;

    if (startDate) query = query.where('date', '>=', startDate);
    if (endDate) query = query.where('date', '<=', endDate);

    const snapshot = await query.get();
    let totalExpenses = 0;
    let count = 0;
    const byCategory = {};

    snapshot.forEach(doc => {
        const d = doc.data();
        const amount = Number(d.amount) || 0;
        totalExpenses += amount;
        count++;

        if (!byCategory[d.category]) byCategory[d.category] = { _id: d.category, total: 0, count: 0 };
        byCategory[d.category].total += amount;
        byCategory[d.category].count++;
    });

    res.status(200).json({
        success: true,
        data: {
            overall: { totalExpenses, count, avgExpense: count ? totalExpenses / count : 0 },
            byCategory: Object.values(byCategory).sort((a, b) => b.total - a.total)
        }
    });
});

// @desc    Get monthly expense summary
exports.getMonthlyExpenses = asyncHandler(async (req, res, next) => {
    const { year = new Date().getFullYear() } = req.query;
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31T23:59:59`);

    // Let's stick to fetchAll and filter for now to be safe against different date formats during migration
    let allExpenses = [];
    const snapshot = await expensesColl.get();
    snapshot.forEach(doc => allExpenses.push(doc.data()));

    const yearlyExpenses = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
    });

    const monthlyData = {};
    for (let i = 1; i <= 12; i++) {
        monthlyData[i] = { total: 0, count: 0 };
    }

    yearlyExpenses.forEach(e => {
        const d = new Date(e.date);
        const month = d.getMonth() + 1; // 1-12
        monthlyData[month].total += (Number(e.amount) || 0);
        monthlyData[month].count++;
    });

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formattedData = Object.entries(monthlyData).map(([monthNum, data]) => ({
        month: monthNames[monthNum - 1],
        monthNumber: parseInt(monthNum),
        total: data.total,
        count: data.count
    }));

    res.status(200).json({
        success: true,
        year: parseInt(year),
        data: formattedData
    });
});

