require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { cleanupOldFiles } = require('./utils/excelExport');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware - CORS Configuration (Simplified for Production)
const allowedOrigins = [
    'https://momnme.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

// Add FRONTEND_URL from environment if it exists
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log('🔐 CORS allowed origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Check if the origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Log blocked attempts for debugging
        console.log('⚠️ CORS blocked origin:', origin);
        console.log('   Allowed origins:', allowedOrigins);

        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Block the request
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // Cache preflight for 10 minutes
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MOM & ME\'s API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to MOM & ME\'s API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            orders: '/api/orders',
            expenses: '/api/expenses',
            reports: '/api/reports',
            notifications: '/api/notifications'
        }
    });
});

// Error handlers (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Cleanup old CSV files daily
setInterval(() => {
    cleanupOldFiles();
}, 24 * 60 * 60 * 1000); // Run once per day

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 MOM & ME's Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

module.exports = app;
