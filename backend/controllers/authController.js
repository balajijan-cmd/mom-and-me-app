const User = require('../models/User');
const { sendTokenResponse } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const crypto = require('crypto');

// @desc    Register new user (admin only - first user can self-register)
// @route   POST /api/auth/register
// @access  Public (for first user) / Private (for subsequent users)
exports.register = asyncHandler(async (req, res, next) => {
    const { username, password, fullName } = req.body;

    // Validation
    if (!username || !password || !fullName) {
        return res.status(400).json({
            success: false,
            message: 'Please provide username, password, and full name'
        });
    }

    // Check if this is the first user
    const userCount = await User.countDocuments();

    // If not first user, require authentication
    if (userCount > 0 && !req.user) {
        return res.status(401).json({
            success: false,
            message: 'Only existing admins can create new users'
        });
    }

    // Create user
    const user = await User.create({
        username,
        password,
        fullName,
        role: 'admin'
    });

    // Send token response
    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide username and password'
        });
    }

    // Check for user (include password field)
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Your account has been deactivated. Please contact administrator.'
        });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Send token response
    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        fullName: req.body.fullName,
        username: req.body.username
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
        return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Validate new password
    if (!req.body.newPassword || req.body.newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long'
        });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // For now, just return the token (in production, send via email)
    // TODO: Implement email sending
    res.status(200).json({
        success: true,
        message: 'Password reset token generated',
        resetToken // Remove this in production, send via email instead
    });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (admin only)
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Deactivate user
// @route   PUT /api/auth/users/:id/deactivate
// @access  Private (admin only)
exports.deactivateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Activate user
// @route   PUT /api/auth/users/:id/activate
// @access  Private (admin only)
exports.activateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.status(200).json({
        success: true,
        data: user
    });
});
