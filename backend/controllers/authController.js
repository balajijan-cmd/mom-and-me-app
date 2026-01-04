const { db } = require('../config/firebase');
const { sendTokenResponse } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Helper to compare password
const comparePassword = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (for first user) / Private
exports.register = asyncHandler(async (req, res, next) => {
    const { username, password, fullName } = req.body;

    if (!username || !password || !fullName) {
        return res.status(400).json({ success: false, message: 'Please provide username, password, and full name' });
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    if (!snapshot.empty) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Check if first user
    const allUsersSnapshot = await usersRef.limit(1).get();
    const isFirstUser = allUsersSnapshot.empty;

    if (!isFirstUser && !req.user) {
        return res.status(401).json({ success: false, message: 'Only existing admins can create new users' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
        username,
        password: hashedPassword,
        fullName,
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString()
    };

    const docRef = await usersRef.add(newUser);
    const userWithId = { ...newUser, _id: docRef.id };

    sendTokenResponse(userWithId, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).limit(1).get();

    if (snapshot.empty) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    user._id = userDoc.id;

    if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account deactivated' });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    await userDoc.ref.update({ lastLogin: new Date().toISOString() });

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    // req.user is set by protect middleware
    res.status(200).json({ success: true, data: req.user });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { fullName, username } = req.body;
    const userRef = db.collection('users').doc(req.user.id);

    await userRef.update({
        fullName: fullName || req.user.fullName,
        username: username || req.user.username
    });

    const updatedDoc = await userRef.get();
    const updatedUser = { ...updatedDoc.data(), id: updatedDoc.id, _id: updatedDoc.id };

    res.status(200).json({ success: true, data: updatedUser });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
    // In Firestore, we have to fetch the user again to get the password field if we didn't include it in req.user
    // But let's assume we do a quick fetch
    const userRef = db.collection('users').doc(req.user.id);
    const doc = await userRef.get();
    const userData = doc.data();

    if (!(await comparePassword(req.body.currentPassword, userData.password))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (!req.body.newPassword || req.body.newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password min 6 chars' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    await userRef.update({ password: hashedPassword });

    // Send new token
    const user = { ...userData, _id: doc.id };
    sendTokenResponse(user, 200, res);
});

// @desc    Get all users
// @route   GET /api/auth/users
exports.getUsers = asyncHandler(async (req, res, next) => {
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        delete data.password; // Don't send password
        users.push({ ...data, _id: doc.id });
    });

    res.status(200).json({ success: true, count: users.length, data: users });
});


// @desc    Forgot password (stub)
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // Simplified: Just say not implemented or log
    res.status(501).json({ success: false, message: 'Forgot Password not implemented in Firebase Migration yet.' });
});

// @desc    Reset password (stub)
exports.resetPassword = asyncHandler(async (req, res, next) => {
    res.status(501).json({ success: false, message: 'not implemented' });
});

// @desc    Deactivate user
exports.deactivateUser = asyncHandler(async (req, res, next) => {
    await db.collection('users').doc(req.params.id).update({ isActive: false });
    res.status(200).json({ success: true, data: {} });
});

// @desc    Activate user
exports.activateUser = asyncHandler(async (req, res, next) => {
    await db.collection('users').doc(req.params.id).update({ isActive: true });
    res.status(200).json({ success: true, data: {} });
});
