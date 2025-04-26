const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');
const {default:httpStatus} = require('http-status');

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
            if(user.isLoggedIn) {
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
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: 'Invalid token',
                logout: true 
            });
        }
}

const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
        }
        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findById(decoded._id);
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
            }
            // Check if token is expired
            if (decoded.exp * 1000 < Date.now()) {
                // Remove expired token
                user.tokens = user.tokens.filter(t => t.token !== token);
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
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: 'Invalid token',
                logout: true 
            });
        }

    } catch (error) {
        console.error('User Auth Middleware Error:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

module.exports = {
    userAuth,
    isRegisteredUser
};