const path = require('path');
const fs = require('fs');

/**
 * Helper to escape CSV fields
 */
const escapeCSV = (field) => {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

/**
 * Export orders to CSV file
 * @param {Array} orders - Array of order objects
 * @param {Array} expenses - Array of expense objects (optional)
 * @returns {String} - Path to generated CSV file
 */
const exportToCSV = async (orders, expenses = []) => {
    try {
        // Create exports directory if it doesn't exist
        const exportsDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `orders_report_${timestamp}_${Date.now()}.csv`;
        const filepath = path.join(exportsDir, filename);

        // --- Build CSV Content String ---
        let csvContent = '';

        // 1. ORDERS SECTION
        const orderHeaders = [
            'Order No.', 'Order No. from Book', 'Customer Name', 'Phone Number',
            'Category', 'Order Date', 'Trial Date', 'Delivery Date',
            'Total Amount', 'Advance Received', 'Balance Amount Recvd', 'Pending Amount', 'Status'
        ];
        csvContent += orderHeaders.join(',') + '\n';

        orders.forEach(order => {
            const row = [
                order.orderNo,
                order.orderNoFromBook,
                order.customerName,
                order.phoneNumber,
                order.category,
                order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : '',
                order.trialDate ? new Date(order.trialDate).toLocaleDateString('en-IN') : '',
                order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN') : '',
                order.totalAmount || 0,
                order.advanceAmountPaid || 0,
                order.balanceAmountReceived || 0,
                order.balance || 0,
                order.status
            ];
            csvContent += row.map(escapeCSV).join(',') + '\n';
        });

        // 2. EXPENSES & SUMMARY SECTION
        if (expenses.length > 0) {
            csvContent += '\n\n'; // Spacing

            // Financial Summary
            const totalIncome = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const profit = totalIncome - totalExpenses;

            csvContent += 'FINANCIAL SUMMARY\n';
            csvContent += `Total Income,${totalIncome}\n`;
            csvContent += `Total Expenses,${totalExpenses}\n`;
            csvContent += `Net Profit,${profit}\n\n`;

            // Expenses Detail Header
            csvContent += 'EXPENSES DETAILS\n';
            csvContent += 'Date,Category,Description,Amount\n';

            // Expenses Rows
            expenses.forEach(exp => {
                const row = [
                    exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : '',
                    exp.category,
                    exp.description,
                    exp.amount
                ];
                csvContent += row.map(escapeCSV).join(',') + '\n';
            });
        }

        // Write file once
        await fs.promises.writeFile(filepath, csvContent, 'utf8');

        return filepath;
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw new Error('Failed to export data to CSV');
    }
};

/**
 * Clean up old CSV files
 */
const cleanupOldCSVFiles = () => {
    try {
        const exportsDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportsDir)) return;

        const files = fs.readdirSync(exportsDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000;

        files.forEach(file => {
            const filepath = path.join(exportsDir, file);
            const stats = fs.statSync(filepath);
            if (now - stats.mtimeMs > maxAge) {
                fs.unlinkSync(filepath);
                console.log(`Deleted old CSV: ${file}`);
            }
        });
    } catch (error) {
        console.error('Error cleaning up CSV:', error);
    }
};

module.exports = { exportToCSV, cleanupOldCSVFiles };
