const { default: httpStatus } = require('http-status');
const { studentDetailsSchema } = require('../../../utils/validations/allow-box/studentDetails');

const { studentsAttendanceSchema } = require('../../../utils/validations/allow-box/attendance');
const validatestudentDetails = (req, res, next) => {
    const { error } = studentDetailsSchema.validate(req.body);
    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.details[0].message });
    }
    next();
}

module.exports = {
    validatestudentDetails
}