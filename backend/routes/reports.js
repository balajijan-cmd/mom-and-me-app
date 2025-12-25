const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getDailySalesReport,
    getPendingOrdersReport,
    getPaymentStatusReport,
    exportReport,
    getCustomReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/daily-sales', getDailySalesReport);
router.get('/pending-orders', getPendingOrdersReport);
router.get('/payment-status', getPaymentStatusReport);
router.get('/export', exportReport);
router.post('/custom', getCustomReport);

module.exports = router;
