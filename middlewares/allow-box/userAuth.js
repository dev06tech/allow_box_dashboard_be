const jwt = require('jsonwebtoken');
const User = require('../../models/allow-box/user.model');
const config = require('../../config/config');
const { default: httpStatus } = require('http-status');

const isRegisteredUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No Registration token provided' });
    }
    try {
        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        if (user.isLoggedIn) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already logged in' });
        }
        if (decoded.exp * 1000 < Date.now()) {
            user.registrationToken = user.registrationToken.filter(t => t.token !== token);
            user.isLoggedIn = false;
            await user.save();
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Token expired',
                logout: true
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const decoded = jwt.decode(token); // decode without verifying
            const user = await User.findById(decoded?._id);

            if (user) {
                user.tokens = user.tokens.filter(t => t.token !== token);
                user.isLoggedIn = false;
                await user.save();
            }

            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Token expired',
                logout: true
            });
        }
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Invalid token',
            logout: true
        });
    }
}

const userAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Authentication required. Please provide a valid Bearer token.'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwt.secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: 'Your session has expired. Please log in again.',
                    logout: true,
                    errorType: 'TOKEN_EXPIRED'
                });
            }
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Invalid authentication token.',
                logout: true,
                errorType: 'TOKEN_INVALID'
            });
        }
        const user = await User.findById(decoded._id).select('+tokens +isLoggedIn, +isEmailVerified');
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'User account not found or has been deleted.',
                logout: true,
                errorType: 'USER_NOT_FOUND'
            });
        }
        if (!user.isLoggedIn) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'You have been logged out. Please log in again.',
                logout: true,
                errorType: 'USER_LOGGED_OUT'
            });
        }
        const tokenExists = user.tokens.some(t => t.token === token);
        if (!tokenExists) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Session is no longer valid. Please log in again.',
                logout: true,
                errorType: 'TOKEN_NOT_FOUND'
            });
        }
        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred during authentication. Please try again.',
            errorType: 'SERVER_ERROR'
        });
    }
};

module.exports = {
    userAuth,
    isRegisteredUser
};