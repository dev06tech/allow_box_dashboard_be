const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const logger = require("../../config/logger");
const { default: httpStatus } = require("http-status");

const studentDetailsSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    rollNumber: {
        type: Number
    },
    parentName: {
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
    marks: [{
        subject: {
            type: String
        },
        examDate: {
            type: Date
        },
        score: {
            type: Number
        },
        isPassed: {
            type: Boolean
        }
    }],

});

const StudentDetails = mongoose.model("studentDetails", studentDetailsSchema);

module.exports = StudentDetails;