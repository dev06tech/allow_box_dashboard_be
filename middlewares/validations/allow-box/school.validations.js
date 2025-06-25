const { default: httpStatus } = require('http-status');
const { allowBoxSchoolSchema } = require('../../../utils/validations/allow-box/school');

const validateSchool = (req, res, next) => {
    const { error } = allowBoxSchoolSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
}

module.exports = {
    validateSchool
}