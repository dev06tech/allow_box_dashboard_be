const mongoose = require("mongoose");

const studentDetailsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  
    },
    currentClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String
    },
    rollNumber: {
        type: Number
    },
    parentName: {
        type: String
    },
    parentPhone: {
        type: String
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    address: {
        type: String
    },
    photoUrl: {
        type: String
    },
    academics: [
        {
            academicYear: {
                type: String,
                required: true,
            },
            classId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class',
                required: true,
            },
            promotedToNext: {
                type: Boolean,
                default: false,
            },
            marks: [
                {
                    subject: {
                        type: String
                    },
                    nameOfExam: {
                        type: String
                    },
                    obtainedMarks: {
                        type: Number
                    },
                    totalMarks: {
                        type: Number
                    },
                    examDate: {
                        type: Date
                    },
                    isPassed: {
                        type: Boolean
                    },
                },
            ],
        },
    ],

});
studentDetailsSchema.set("timestamps", true);

studentDetailsSchema.index({ studentId: 1 });
studentDetailsSchema.index({ class: 1 });
studentDetailsSchema.index({ parentId: 1 });

const StudentDetails = mongoose.model("StudentDetails", studentDetailsSchema);

module.exports = StudentDetails;