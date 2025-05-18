const jwt = require('jsonwebtoken');
const SupertAdmin = require('../../models/slate/superAdmin.model');
const config = require('../../config/config');
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
            console.log(decoded);
                     
            const superAdmin = await SupertAdmin.findById(decoded._id);
            if (!superAdmin) {
                return res.status(httpStatus.NOT_FOUND).json({ message: 'Super Admin not found' });
            }
            if (!superAdmin.isLoggedIn) {
                return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Super Admin is logged out' });
            }
            req.superAdmin = superAdmin;
            req.token = token;
            next();
        } catch (error) {
            console.log(error);
            if (error.name === 'TokenExpiredError') {
            const decoded = jwt.decode(token); // decode without verifying
            const superAdmin = await SupertAdmin.findById(decoded?._id);

            if (superAdmin) {
                superAdmin.tokens = superAdmin.tokens.filter(t => t.token !== token);
                superAdmin.isLoggedIn = false;
                await superAdmin.save();
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
    } catch (error) {
        next(error);
    }
}

module.exports = {
    superAdminAuth
};