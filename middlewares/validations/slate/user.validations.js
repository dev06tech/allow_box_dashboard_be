const {default:httpStatus} = require('http-status');
const { 
    registrationSchema, 
    loginSchema,
    schoolRegistrationSchema,
    userUpdateSchema
 } = require('../../../utils/validations/slate/users');

const validateRegistration = (req, res, next) => {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateSchoolRegistration = (req, res, next) => {
    const { error } = schoolRegistrationSchema.validate(req.body);
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

const validateUserUpdate = (req, res, next) => {
    const { error } = userUpdateSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateSchoolRegistration,
    validateUserUpdate
};