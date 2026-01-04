const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        // Allow token in query params for file downloads
        token = req.query.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Please login.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from Firestore
        const userDoc = await db.collection('users').doc(decoded.id).get();

        if (!userDoc.exists) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.'
            });
        }

        const user = userDoc.data();
        // Attach user ID manually since it's not in the data usually
        user._id = userDoc.id;
        user.id = userDoc.id; // consistency

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

// Generate JWT token
exports.getSignedJwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h'
    });
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res, token = null) => {
    // Create token if not passed
    const authToken = token || exports.getSignedJwtToken(user._id || user.id);

    res.status(statusCode).json({
        success: true,
        token: authToken,
        user: {
            id: user._id || user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role
        }
    });
};
