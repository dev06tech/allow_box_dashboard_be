const { default: httpStatus } = require('http-status');
const {
    createSchool,
    updateSchool
} = require('../../../utils/validations/slate/schools');

const validateCreateSchool = (req, res, next) => {
    const { error } = createSchool.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

const validateUpdateSchool = (req, res, next) => {
    const { error } = updateSchool.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateCreateSchool,
    validateUpdateSchool
};