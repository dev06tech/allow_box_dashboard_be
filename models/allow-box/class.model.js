const mongoose = require("mongoose");
const ApiError = require('../../utils/ApiError');
const { default: httpStatus } = require('http-status');

const classSchema = new mongoose.Schema({
    name: {
        type: String
    },
    division: {
        type: String
    },
    associatedSchool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    subjects: [
        {
            name: String,
            assignedTeacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            substituteTeacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        }
    ],
    yearlyCLassFees: {
        type: Number,
        required: true
    }
});

classSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (!update || !update.subjects) return next();
    const subjects = update.subjects;
    const names = subjects?.map(s => s?.name?.trim().toLowerCase());
    const uniqueNames = new Set(names);
    const students = update.students;
    const studentIds = students?.map(s => s?.studentId?.toString());
    const uniqueStudentIds = new Set(studentIds);
    if (names.length !== uniqueNames.size) {
        return next(new ApiError(httpStatus.BAD_REQUEST, "Duplicate subject names are not allowed."));
    }
    if (students.length !== uniqueStudentIds.size) {
        return next(new ApiError(httpStatus.BAD_REQUEST, "Duplicate student IDs are not allowed."));
    }
    next();
});



classSchema.set("timestamps", true);

module.exports = mongoose.model("Class", classSchema);