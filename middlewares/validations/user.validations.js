const {default:httpStatus} = require('http-status');
const { 
    registrationSchema, 
    emailVerificationSchema, 
    loginSchema,
    updatePasswordSchema } = require('../../utils/validations/users');

const validateRegistration = (req, res, next) => {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateEmailVerification = (req, res, next) => {
    const { error } = emailVerificationSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const changePassword = (req, res, next) => {
    const { error } = updatePasswordSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};


module.exports = {
    validateRegistration,
    validateEmailVerification,
    validateLogin,
    changePassword
};