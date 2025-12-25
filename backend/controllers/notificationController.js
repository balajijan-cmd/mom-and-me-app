const Notification = require('../models/Notification');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const { isRead, limit = 20 } = req.query;

    let query = {};
    if (isRead !== undefined) {
        query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
        .populate('orderId', 'orderNo customerName trialDate deliveryDate')
        .sort('-createdAt')
        .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Notification not found'
        });
    }

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
        { isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({
            success: false,
            message: 'Notification not found'
        });
    }

    await notification.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Notification deleted'
    });
});

// @desc    Check and create reminders for upcoming trials and deliveries
// @route   POST /api/notifications/check-reminders
// @access  Private
exports.checkReminders = asyncHandler(async (req, res, next) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Check for trial reminders
    const upcomingTrials = await Order.find({
        trialDate: {
            $gte: tomorrow,
            $lt: dayAfterTomorrow
        },
        status: { $ne: 'Completed' }
    });

    for (const order of upcomingTrials) {
        // Check if notification already exists
        const existingNotification = await Notification.findOne({
            type: 'trial_reminder',
            orderId: order._id,
            createdAt: { $gte: tomorrow }
        });

        if (!existingNotification) {
            await Notification.create({
                type: 'trial_reminder',
                orderId: order._id,
                message: `Trial scheduled tomorrow for ${order.customerName} (Order: ${order.orderNo})`
            });
        }
    }

    // Check for delivery reminders
    const upcomingDeliveries = await Order.find({
        deliveryDate: {
            $gte: tomorrow,
            $lt: dayAfterTomorrow
        },
        status: { $ne: 'Completed' }
    });

    for (const order of upcomingDeliveries) {
        // Check if notification already exists
        const existingNotification = await Notification.findOne({
            type: 'delivery_reminder',
            orderId: order._id,
            createdAt: { $gte: tomorrow }
        });

        if (!existingNotification) {
            await Notification.create({
                type: 'delivery_reminder',
                orderId: order._id,
                message: `Delivery scheduled tomorrow for ${order.customerName} (Order: ${order.orderNo})`
            });
        }
    }

    // Check for payment reminders (orders with pending balance and delivery date passed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueOrders = await Order.find({
        balance: { $gt: 0 },
        deliveryDate: { $lt: today },
        status: 'Completed'
    });

    for (const order of overdueOrders) {
        // Check if notification was created in last 7 days
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const existingNotification = await Notification.findOne({
            type: 'payment_reminder',
            orderId: order._id,
            createdAt: { $gte: sevenDaysAgo }
        });

        if (!existingNotification) {
            await Notification.create({
                type: 'payment_reminder',
                orderId: order._id,
                message: `Payment pending: ₹${order.balance} for ${order.customerName} (Order: ${order.orderNo})`
            });
        }
    }

    res.status(200).json({
        success: true,
        message: 'Reminders checked and created',
        data: {
            trialsCount: upcomingTrials.length,
            deliveriesCount: upcomingDeliveries.length,
            paymentRemindersCount: overdueOrders.length
        }
    });
});
