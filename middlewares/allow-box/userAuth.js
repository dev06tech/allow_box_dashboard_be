const jwt = require('jsonwebtoken');
const User = require('../../models/allow-box/user.model');
const config = require('../../config/config');
const { default: httpStatus } = require('http-status');

const isRegisteredUser = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Authentication required. Please provide a valid Bearer token.'
        });
    }
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
        if(user.isEmailVerified){
            user.registrationToken = []
            await user.save();
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Email already verified' });
        }
        if (user.isLoggedIn) {
            user.registrationToken = []
            await user.save();
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already logged in' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const decoded = jwt.decode(token); // decode without verifying
            const user = await User.findById(decoded?._id);

            if (user) {
                user.registrationToken = []
                user.isLoggedIn = false;
                await user.save();
            }

            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Token expired, please request new verification email',
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
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Authentication required. Please provide a valid Bearer token.'
        });
    }
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
        if(!user.isEmailVerified){
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Email not verified, Please verify your email' });
        }
        if (!user.isLoggedIn) {
            user.tokens = []
            await user.save();
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'User not logged in, Please login' });
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const decoded = jwt.decode(token); // decode without verifying
            const user = await User.findById(decoded?._id);

            if (user) {
                user.tokens = []
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
};

module.exports = {
    userAuth,
    isRegisteredUser
};