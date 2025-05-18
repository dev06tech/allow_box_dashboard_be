const { default: httpStatus } = require('http-status');
const {
    registrationSchema,
    emailVerificationSchema,
    loginSchema,
    updatePasswordSchema,
    forgotPasswordSchema,
    newUserchema
} = require('../../../utils/validations/allow-box/users');

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

const validateChangePassword = (req, res, next) => {
    const { error } = updatePasswordSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateForgotPassword = (req, res, next) => {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateNewUser = (req, res, next) => {
    const dataToValidate = { ...req.body, ...req.params };
    const { error } = newUserchema.validate(dataToValidate);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateEmailVerification,
    validateLogin,
    validateChangePassword,
    validateForgotPassword,
    validateNewUser
};