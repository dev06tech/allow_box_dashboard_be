const { default: httpStatus } = require('http-status');
const ApiError = require('../../utils/ApiError');
const StudentDetails = require('../../models/allow-box/studentDetails.model');
const User = require('../../models/allow-box/user.model');
const { log } = require('winston');


const createStudentDetails = async (requester, studentData) => {
    try {
        const isValidStudent = await User.findOne({
            _id: studentData.studentId,
            associatedSchool: requester.associatedSchool
        });
        if (!isValidStudent) {
            throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
        }
        const studentDetails = new StudentDetails(studentData);
        await studentDetails.save();
        return studentDetails;
    } catch (error) {
        throw error;
    }
};

const updateStudentDetails = async (requester, studentData) => {    
    try {
        const isValidStudent = await User.findOne({
            _id: studentData.studentId,
            associatedSchool: requester.associatedSchool
        });
        if (!isValidStudent) {
            throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
        }
        const studentDetails = await StudentDetails.findOneAndUpdate({ studentId: studentData.studentId }, studentData, { new: true });
        return studentDetails;
    } catch (error) {
        throw error;
    }
};

const deleteStudentDetails = async (requester, studentId) => {
    try {
        const isValidStudent = await User.findOne({
            _id: studentId,
            associatedSchool: requester.associatedSchool
        });
        if (!isValidStudent) {
            throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
        }
        const studentDetails = await StudentDetails.findOneAndDelete({ studentId });
        return studentDetails;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createStudentDetails,
    updateStudentDetails,
    deleteStudentDetails
}