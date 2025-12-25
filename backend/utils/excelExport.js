const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Export data to Excel file with multiple sheets
 * @param {Array} orders - Array of order objects
 * @param {Array} expenses - Array of expense objects
 * @returns {String} - Path to generated Excel file
 */
const exportToExcel = async (orders, expenses = []) => {
    try {
        const exportsDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `Report_${timestamp}_${Date.now()}.xlsx`;
        const filepath = path.join(exportsDir, filename);

        // --- CALCULATE TOTALS ---
        const totalIncome = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalAdvance = orders.reduce((sum, order) => sum + (order.advanceAmountPaid || 0), 0);
        const totalBalanceRecd = orders.reduce((sum, order) => sum + (order.balanceAmountReceived || 0), 0);
        const totalPending = orders.reduce((sum, order) => sum + (order.balance || 0), 0);

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        const workbook = XLSX.utils.book_new();

        // --- SHEET 1: FINANCIAL SUMMARY ---
        const summaryRows = [
            { Metric: 'Total Income', Amount: totalIncome },
            { Metric: 'Advance', Amount: totalAdvance },
            { Metric: 'Balance Recd', Amount: totalBalanceRecd },
            { Metric: 'Total Expenses', Amount: totalExpenses },
            { Metric: 'Net Profit', Amount: netProfit }
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
        // Adjust column width
        summarySheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Financial Summary");


        // --- SHEET 2: ORDERS ---
        const orderRows = orders.map(order => ({
            'Order No': order.orderNo,
            'Book No': order.orderNoFromBook,
            'Customer Name': order.customerName,
            'Phone': order.phoneNumber,
            'Category': order.category,
            'Order Date': order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : '',
            'Trial Date': order.trialDate ? new Date(order.trialDate).toLocaleDateString('en-IN') : '',
            'Delivery Date': order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN') : '',
            'Amount': order.totalAmount || 0,
            'Advance': order.advanceAmountPaid || 0,
            'Balance Recvd': order.balanceAmountReceived || 0,
            'Pending': order.balance || 0,
            'Status': order.status
        }));

        // Append Totals Row to Orders
        orderRows.push({
            'Order No': 'TOTALS',
            'Book No': '',
            'Customer Name': '',
            'Phone': '',
            'Category': '',
            'Order Date': '',
            'Trial Date': '',
            'Delivery Date': '',
            'Amount': totalIncome,
            'Advance': totalAdvance,
            'Balance Recvd': totalBalanceRecd,
            'Pending': totalPending,
            'Status': ''
        });

        const ordersSheet = XLSX.utils.json_to_sheet(orderRows);
        XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");


        // --- SHEET 3: EXPENSES ---
        const expenseRows = expenses.map(exp => ({
            'Date': exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : '',
            'Category': exp.category,
            'Description': exp.description,
            'Amount': exp.amount
        }));
        // Append Total Row to Expenses
        expenseRows.push({
            'Date': 'TOTAL',
            'Category': '',
            'Description': '',
            'Amount': totalExpenses
        });

        const expensesSheet = XLSX.utils.json_to_sheet(expenseRows);
        XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expenses Details");

        // Write File
        XLSX.writeFile(workbook, filepath);
        return filepath;

    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Failed to export data to Excel');
    }
};

/**
 * Clean up old Excel files
 */
const cleanupOldFiles = () => {
    try {
        const exportsDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportsDir)) return;

        const files = fs.readdirSync(exportsDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000;

        files.forEach(file => {
            const filepath = path.join(exportsDir, file);
            if (file.endsWith('.csv') || file.endsWith('.xlsx')) {
                const stats = fs.statSync(filepath);
                if (now - stats.mtimeMs > maxAge) {
                    fs.unlinkSync(filepath);
                }
            }
        });
    } catch (error) {
        console.error('Error cleaning up files:', error);
    }
};

module.exports = { exportToExcel, cleanupOldFiles };
