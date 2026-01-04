const { db, bucket } = require('../config/firebase');
const { asyncHandler } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Helper to get Orders Collection
const ordersColl = db.collection('orders');

// @desc    Get all orders
// @route   GET /api/orders
exports.getOrders = asyncHandler(async (req, res, next) => {
    let query = ordersColl;

    // Filtering
    if (req.query.status) query = query.where('status', '==', req.query.status);
    if (req.query.category) query = query.where('category', '==', req.query.category);

    // Note: Firestore doesn't support regex search easily (req.query.search).
    // For now, we will fetch results and filter in memory if search is present (not efficient for huge data, but fine for small shop)

    // Sorting: Firestore requires index for sorting on different fields. 
    // We'll simplisticly get all and sort/filter in JS for this migration to be robust without index setup.
    const snapshot = await query.get();
    let orders = [];
    snapshot.forEach(doc => {
        orders.push({ ...doc.data(), _id: doc.id, id: doc.id });
    });

    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        orders = orders.filter(o =>
            (o.customerName && o.customerName.toLowerCase().includes(search)) ||
            (o.orderNo && o.orderNo.toLowerCase().includes(search)) ||
            (o.phoneNumber && o.phoneNumber.includes(search))
        );
    }

    // Manual date sort desc
    orders.sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate));

    res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res, next) => {
    const doc = await ordersColl.doc(req.params.id).get();
    if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: { ...doc.data(), _id: doc.id, id: doc.id } });
});

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = asyncHandler(async (req, res, next) => {
    // Generate Order No if not exists (Simple logic: Count + 1 or Random)
    // Using simple random for now to avoid concurrency issues without transactions
    if (!req.body.orderNo) {
        const count = (await ordersColl.count().get()).data().count;
        req.body.orderNo = `ORD-${1000 + count + 1}`;
    }

    const newOrder = {
        ...req.body,
        user: req.user.id, // Store creator ID
        createdAt: new Date().toISOString(),
        status: req.body.status || 'Pending',
        customerPhotos: [],
        balance: (Number(req.body.totalAmount) || 0) - (Number(req.body.advanceAmountPaid) || 0) - (Number(req.body.balanceAmountReceived) || 0)
    };

    const docRef = await ordersColl.add(newOrder);

    res.status(201).json({ success: true, data: { ...newOrder, _id: docRef.id, id: docRef.id } });
});

// @desc    Update order
// @route   PUT /api/orders/:id
exports.updateOrder = asyncHandler(async (req, res, next) => {
    const docRef = ordersColl.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ success: false, message: 'Order not found' });

    let updateData = { ...req.body };

    // Recalculate balance
    // Need to merge with existing data to calculate correctly if fields are missing in update
    const currentData = doc.data();
    const total = updateData.totalAmount !== undefined ? Number(updateData.totalAmount) : Number(currentData.totalAmount || 0);
    const advance = updateData.advanceAmountPaid !== undefined ? Number(updateData.advanceAmountPaid) : Number(currentData.advanceAmountPaid || 0);
    const received = updateData.balanceAmountReceived !== undefined ? Number(updateData.balanceAmountReceived) : Number(currentData.balanceAmountReceived || 0);

    updateData.balance = total - advance - received;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    res.status(200).json({ success: true, data: { ...updatedDoc.data(), _id: updatedDoc.id, id: updatedDoc.id } });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
exports.deleteOrder = asyncHandler(async (req, res, next) => {
    const docRef = ordersColl.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ success: false, message: 'Order not found' });

    // TODO: Delete images from storage if needed

    await docRef.delete();
    res.status(200).json({ success: true, data: {} });
});

// @desc    Upload photos
// @route   POST /api/orders/:id/photos
exports.uploadPhotos = asyncHandler(async (req, res, next) => {
    const docRef = ordersColl.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });

    const photoUrls = [];

    for (const file of req.files) {
        const filename = `orders/${req.params.id}/${uuidv4()}${path.extname(file.originalname)}`;
        const fileRef = bucket.file(filename);

        await fileRef.save(file.buffer, {
            contentType: file.mimetype,
            metadata: {
                firebaseStorageDownloadTokens: uuidv4() // Fake token for console view
            }
        });

        // Make public
        await fileRef.makePublic();

        // Construct public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        photoUrls.push(publicUrl);
    }

    // Update order with new photos (append)
    const currentPhotos = doc.data().customerPhotos || [];
    const newPhotos = [...currentPhotos, ...photoUrls];

    await docRef.update({ customerPhotos: newPhotos });

    res.status(200).json({ success: true, data: newPhotos });
});

// @desc    Delete photo
// @route   DELETE /api/orders/:id/photos/:photoIndex
exports.deletePhoto = asyncHandler(async (req, res, next) => {
    const docRef = ordersColl.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Not found' });

    const photos = doc.data().customerPhotos || [];
    const index = parseInt(req.params.photoIndex);

    if (index < 0 || index >= photos.length) return res.status(400).json({ message: 'Invalid index' });

    // Remove from array (We don't delete from storage in this simple logic as we only have URL)
    photos.splice(index, 1);

    await docRef.update({ customerPhotos: photos });
    res.status(200).json({ success: true, data: photos });
});

// @desc    Get order stats
exports.getOrderStats = asyncHandler(async (req, res, next) => {
    // In efficient Firestore, we should maintain counters.
    // For this app size, aggregation via reading all is acceptable.
    const snapshot = await ordersColl.get();

    let stats = {
        totalOrders: 0,
        pending: 0,
        completed: 0
    };

    snapshot.forEach(doc => {
        const d = doc.data();
        stats.totalOrders++;
        if (d.status === 'Completed') stats.completed++;
        else stats.pending++;
    });

    res.status(200).json({ success: true, data: stats });
});

// @desc    Get upcoming trials
exports.getUpcomingTrials = asyncHandler(async (req, res, next) => {
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await ordersColl
        .where('trialDate', '>=', today)
        .orderBy('trialDate', 'asc')
        .limit(10)
        .get();

    const orders = [];
    snapshot.forEach(doc => orders.push({ ...doc.data(), _id: doc.id }));
    res.status(200).json({ success: true, data: orders });
});

// @desc    Get upcoming deliveries
exports.getUpcomingDeliveries = asyncHandler(async (req, res, next) => {
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await ordersColl
        .where('deliveryDate', '>=', today)
        .orderBy('deliveryDate', 'asc')
        .limit(10)
        .get();

    const orders = [];
    snapshot.forEach(doc => orders.push({ ...doc.data(), _id: doc.id }));
    res.status(200).json({ success: true, data: orders });
});
