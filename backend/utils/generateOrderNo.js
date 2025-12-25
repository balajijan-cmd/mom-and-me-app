const Order = require('../models/Order');

/**
 * Generate unique order number in format: ORD-YYYY-XXXX
 * Example: ORD-2024-0001
 */
const generateOrderNo = async () => {
    const currentYear = new Date().getFullYear();
    const prefix = `ORD-${currentYear}-`;

    try {
        // Find the latest order for current year
        const latestOrder = await Order.findOne({
            orderNo: new RegExp(`^${prefix}`)
        }).sort({ orderNo: -1 });

        let nextNumber = 1;

        if (latestOrder) {
            // Extract the number part and increment
            const lastNumber = parseInt(latestOrder.orderNo.split('-')[2]);
            nextNumber = lastNumber + 1;
        }

        // Pad with zeros (4 digits)
        const paddedNumber = String(nextNumber).padStart(4, '0');

        return `${prefix}${paddedNumber}`;
    } catch (error) {
        console.error('Error generating order number:', error);
        // Fallback to timestamp-based number
        return `ORD-${currentYear}-${Date.now().toString().slice(-4)}`;
    }
};

module.exports = generateOrderNo;
