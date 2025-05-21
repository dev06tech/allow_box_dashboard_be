const mongoose = require('mongoose');
const { default: httpStatus } = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
    let error = err;   
     
    if (!(error instanceof ApiError)) {
        const statusCode = 
            error.statusCode ? error.statusCode :
            error.code === 11000 ? httpStatus.BAD_REQUEST :
            error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : 
            httpStatus.INTERNAL_SERVER_ERROR;
        
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);

    }
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
    // Only replace the message if it's literally "not found" with no other context
    if (typeof message === 'string' && message.toLowerCase() === 'not found') {
        statusCode = httpStatus.NOT_FOUND;
        message = 'Not Found';
    }    
    if (statusCode === httpStatus.NOT_FOUND && !message) {
        message = 'Not Found';
    }

    if (!statusCode || typeof statusCode !== 'number') {
        statusCode = 500;
    }
    if (config.env === 'production' && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }
    res.locals.errorMessage = err.message;
    const response = {
        code: statusCode,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    };
    if (config.env === 'development') {
        logger.error(err);
    }
    res.status(statusCode).send(response);
};

module.exports = {
    errorConverter,
    errorHandler
};