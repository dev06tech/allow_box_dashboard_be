const { default: httpStatus } = require('http-status');
const {
    registrationSchema,
    emailVerificationSchema,
    loginSchema,
    updatePasswordSchema,
    resetPasswordSchema,
    newUserSchema,
    userUpdateSchema,
    validateUserSchema
} = require('../../../utils/validations/allow-box/users');

const {
    studentsAttendanceSchema
} = require('../../../utils/validations/allow-box/attendance');


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

const validateResetPassword = (req, res, next) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateNewUser = (req, res, next) => {
    const dataToValidate = { ...req.body, ...req.params };
    const { error } = newUserSchema.validate(dataToValidate);
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
}

const validateUserId = (req, res, next) => {
    const { error } = validateUserSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateStudentsAttendance = (req, res, next) => {
    const { error } = studentsAttendanceSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
}

module.exports = {
    validateRegistration,
    validateEmailVerification,
    validateLogin,
    validateChangePassword,
    validateResetPassword,
    validateNewUser,
    validateUserUpdate,
    validateUserId,
    validateStudentsAttendance
};