const jwt = require('jsonwebtoken');
const SupertAdmin = require('../models/superAdmin.model');
const config = require('../config/config');
const { default: httpStatus } = require('http-status');
const { log } = require('winston');


const superAdminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
        }
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            const superAdmin = await SupertAdmin.findById(decoded._id);
            if (!superAdmin) {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Super Admin not found' });
            }
            if (!superAdmin.isLoggedIn) {
                return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Super Admin is logged out' });
            }
            if (decoded.exp * 1000 < Date.now()) {
                superAdmin.tokens = superAdmin.tokens.filter(t => t.token !== token);
                superAdmin.isLoggedIn = false;
                await superAdmin.save();
                return res.status(httpStatus.UNAUTHORIZED).json({
                    message: 'Token expired',
                    logout: true
                });
            }

            req.superAdmin = superAdmin;
            req.token = token;            
            next();
        } catch (error) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: 'Invalid token',
                logout: true
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    superAdminAuth
};