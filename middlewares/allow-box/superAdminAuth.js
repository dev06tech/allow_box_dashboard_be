const jwt = require('jsonwebtoken');
const User = require('../../models/allow-box/user.model');
const config = require('../../config/config');
const { default: httpStatus } = require('http-status');

const superAdminAuth = async (req, res, next) => {
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
        if(user.role !== 'super-admin') {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'You are not authorized to access this resource.',
                logout: true,
                errorType: 'UNAUTHORIZED_ACCESS'
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
  superAdminAuth
};