const { default: httpStatus } = require('http-status');
const { classSchema } = require('../../../utils/validations/allow-box/class');

const validateClass = (req, res, next) => {
    const { error } = classSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
}

module.exports = {
    validateClass
}