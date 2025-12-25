const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');
const generateOrderNo = require('../utils/generateOrderNo');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all orders with pagination, search, and filters
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        category,
        startDate,
        endDate,
        paymentStatus,
        sortBy = '-createdAt'
    } = req.query;

    // Build query
    let query = {};

    // Search by customer name, phone, or order number
    if (search) {
        query.$or = [
            { customerName: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
            { orderNo: { $regex: search, $options: 'i' } },
            { orderNoFromBook: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
        query.orderDate = {};
        if (startDate) query.orderDate.$gte = new Date(startDate);
        if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    // Filter by payment status
    if (paymentStatus) {
        if (paymentStatus === 'Paid') {
            query.balance = 0;
        } else if (paymentStatus === 'Unpaid') {
            query.advanceAmountPaid = 0;
            query.balanceAmountReceived = 0;
        } else if (paymentStatus === 'Partial') {
            query.$or = [
                { advanceAmountPaid: { $gt: 0 } },
                { balanceAmountReceived: { $gt: 0 } }
            ];
            query.balance = { $gt: 0 };
        }
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
        .populate('createdBy', 'fullName username')
        .sort(sortBy)
        .limit(parseInt(limit))
        .skip(skip);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: orders
    });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('createdBy', 'fullName username')
        .populate('statusHistory.changedBy', 'fullName username');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
    // Generate order number
    const orderNo = await generateOrderNo();

    // Add order number and user to request body
    req.body.orderNo = orderNo;
    req.body.createdBy = req.user.id;

    // Add initial status to history
    req.body.statusHistory = [{
        status: req.body.status || 'Pending',
        changedBy: req.user.id,
        changedAt: new Date()
    }];

    const order = await Order.create(req.body);

    res.status(201).json({
        success: true,
        data: order
    });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
    let order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Check if status is being updated
    if (req.body.status && req.body.status !== order.status) {
        // Add to status history
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        order.statusHistory.push({
            status: req.body.status,
            changedBy: req.user.id,
            changedAt: new Date()
        });
    }

    // Update order
    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Delete associated images from Cloudinary
    if (order.customerPhotos && order.customerPhotos.length > 0) {
        for (const photoUrl of order.customerPhotos) {
            try {
                // Extract public_id from Cloudinary URL
                const publicId = photoUrl.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    });
});

// @desc    Upload customer photos
// @route   POST /api/orders/:id/photos
// @access  Private
exports.uploadPhotos = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please upload at least one photo'
        });
    }

    // Upload files to Cloudinary
    const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.buffer, file.originalname)
    );

    const photoUrls = await Promise.all(uploadPromises);

    // Add to existing photos
    order.customerPhotos = [...(order.customerPhotos || []), ...photoUrls];
    await order.save();

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Delete customer photo
// @route   DELETE /api/orders/:id/photos/:photoIndex
// @access  Private
exports.deletePhoto = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    const photoIndex = parseInt(req.params.photoIndex);

    if (photoIndex < 0 || photoIndex >= order.customerPhotos.length) {
        return res.status(400).json({
            success: false,
            message: 'Invalid photo index'
        });
    }

    const photoUrl = order.customerPhotos[photoIndex];

    // Delete from Cloudinary
    try {
        const publicId = photoUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }

    // Remove from array
    order.customerPhotos.splice(photoIndex, 1);
    await order.save();

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Get upcoming trials (next 7 days)
// @route   GET /api/orders/upcoming/trials
// @access  Private
exports.getUpcomingTrials = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const orders = await Order.find({
        trialDate: {
            $gte: today,
            $lte: nextWeek
        },
        status: { $ne: 'Completed' }
    })
        .populate('createdBy', 'fullName')
        .sort('trialDate');

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Get upcoming deliveries (next 7 days)
// @route   GET /api/orders/upcoming/deliveries
// @access  Private
exports.getUpcomingDeliveries = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const orders = await Order.find({
        deliveryDate: {
            $gte: today,
            $lte: nextWeek
        },
        status: { $ne: 'Completed' }
    })
        .populate('createdBy', 'fullName')
        .sort('deliveryDate');

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
exports.getOrderStats = asyncHandler(async (req, res, next) => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                totalAdvance: { $sum: '$advanceAmountPaid' },
                totalBalanceReceived: { $sum: '$balanceAmountReceived' },
                totalPending: { $sum: '$balance' }
            }
        }
    ]);

    const statusCounts = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            overall: stats[0] || {},
            byStatus: statusCounts
        }
    });
});
