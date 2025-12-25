const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNo: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    orderNoFromBook: {
        type: String,
        trim: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        index: true
    },
    address: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Blouse',
            'Blouse (1+1)',
            'Salwar/Chudi',
            'Salwar/Chudi(1+1)',
            'Skirt & Top',
            'Saree (Falls and Side Stitch)',
            'Others'
        ]
    },
    orderDate: {
        type: Date,
        required: [true, 'Order date is required'],
        index: true
    },
    trialDate: {
        type: Date,
        index: true
    },
    deliveryDate: {
        type: Date,
        index: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    advanceAmountPaid: {
        type: Number,
        default: 0,
        min: [0, 'Advance amount cannot be negative']
    },
    balanceAmountReceived: {
        type: Number,
        default: 0,
        min: [0, 'Balance amount received cannot be negative']
    },
    balance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Ready for Trial', 'Completed'],
        default: 'Pending',
        index: true
    },
    customerPhotos: [{
        type: String // Cloudinary URLs
    }],
    measurements: {
        bust: String,
        waist: String,
        hip: String,
        length: String,
        shoulder: String,
        sleeveLength: String,
        armHole: String,
        neck: String,
        blouseLength: String,
        salwarLength: String,
        bottom: String,
        slit: String,
        notes: String
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    statusHistory: [{
        status: String,
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Calculate balance before saving
orderSchema.pre('save', function (next) {
    this.balance = this.totalAmount - this.advanceAmountPaid - this.balanceAmountReceived;
    next();
});

// Update balance before updating
orderSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.$set) {
        const totalAmount = update.$set.totalAmount || 0;
        const advanceAmountPaid = update.$set.advanceAmountPaid || 0;
        const balanceAmountReceived = update.$set.balanceAmountReceived || 0;
        update.$set.balance = totalAmount - advanceAmountPaid - balanceAmountReceived;
    }
    next();
});

// Index for text search
orderSchema.index({
    customerName: 'text',
    phoneNumber: 'text',
    orderNo: 'text',
    orderNoFromBook: 'text'
});

// Virtual for payment status
orderSchema.virtual('paymentStatus').get(function () {
    if (this.balance === 0) return 'Paid';
    if (this.advanceAmountPaid === 0 && this.balanceAmountReceived === 0) return 'Unpaid';
    return 'Partial';
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
