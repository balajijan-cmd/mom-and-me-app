const { db } = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');

const notifColl = db.collection('notifications');
const ordersColl = db.collection('orders');

const fetchAll = async (coll) => {
    const snap = await coll.get();
    const items = [];
    snap.forEach(doc => items.push({ ...doc.data(), _id: doc.id, id: doc.id }));
    return items;
};

// @desc    Get all notifications
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const { isRead, limit = 20 } = req.query;
    let query = notifColl;
    if (isRead !== undefined) query = query.where('isRead', '==', isRead === 'true');

    // Sorting by createdAt desc
    const snapshot = await query.get();
    let notifications = [];
    snapshot.forEach(doc => notifications.push({ ...doc.data(), _id: doc.id, id: doc.id }));

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    notifications = notifications.slice(0, parseInt(limit));

    const unreadCount = (await notifColl.where('isRead', '==', false).count().get()).data().count;

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications
    });
});

// @desc    Mark notification as read
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const docRef = notifColl.doc(req.params.id);
    await docRef.update({ isRead: true });
    const updated = await docRef.get();
    res.status(200).json({ success: true, data: { ...updated.data(), _id: updated.id } });
});

// @desc    Mark all notifications as read
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    const batch = db.batch();
    const snap = await notifColl.where('isRead', '==', false).get();
    snap.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
    res.status(200).json({ success: true, message: 'All marked as read' });
});

// @desc    Delete notification
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    await notifColl.doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'Deleted' });
});

// @desc    Check and create reminders
exports.checkReminders = asyncHandler(async (req, res, next) => {
    // This is run by cron or manually.
    // Logic: Fetch orders, filter dates in JS (easiest for small dataset), create notifications

    const orders = await fetchAll(ordersColl);
    const notifications = await fetchAll(notifColl);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const isSameDate = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return date1.toDateString() === date2.toDateString();
    };

    let trialsCount = 0;
    let deliveriesCount = 0;
    let paymentRemindersCount = 0;

    for (const order of orders) {
        if (order.status === 'Completed') continue;

        // Trial Reminder
        if (order.trialDate && isSameDate(order.trialDate, tomorrow)) {
            // Check if notified today
            const existing = notifications.find(n => n.type === 'trial_reminder' && n.orderId === order._id && isSameDate(n.createdAt, new Date()));
            if (!existing) {
                await notifColl.add({
                    type: 'trial_reminder',
                    orderId: order._id, // Just storing ID, frontend might need another fetch if it relies on populate
                    message: `Trial scheduled tomorrow for ${order.customerName} (Order: ${order.orderNo})`,
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
                trialsCount++;
            }
        }

        // Delivery Reminder
        if (order.deliveryDate && isSameDate(order.deliveryDate, tomorrow)) {
            const existing = notifications.find(n => n.type === 'delivery_reminder' && n.orderId === order._id && isSameDate(n.createdAt, new Date()));
            if (!existing) {
                await notifColl.add({
                    type: 'delivery_reminder',
                    orderId: order._id,
                    message: `Delivery scheduled tomorrow for ${order.customerName} (Order: ${order.orderNo})`,
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
                deliveriesCount++;
            }
        }
    }

    // Check overdue payments
    const today = new Date();
    for (const order of orders) {
        // Completed but unpaid? Or just overdue?
        // Logic from previous controller: balance > 0, deliveryDate < today, status 'Completed'
        if (order.status === 'Completed' && (Number(order.balance) || 0) > 0 && order.deliveryDate && new Date(order.deliveryDate) < today) {
            // Check if notified in last 7 days
            const existing = notifications.find(n => {
                const diff = (new Date() - new Date(n.createdAt)) / (1000 * 3600 * 24);
                return n.type === 'payment_reminder' && n.orderId === order._id && diff < 7;
            });

            if (!existing) {
                await notifColl.add({
                    type: 'payment_reminder',
                    orderId: order._id,
                    message: `Payment pending: ₹${order.balance} for ${order.customerName}`,
                    isRead: false,
                    createdAt: new Date().toISOString()
                });
                paymentRemindersCount++;
            }
        }
    }

    res.status(200).json({
        success: true,
        data: { trialsCount, deliveriesCount, paymentRemindersCount }
    });
});
