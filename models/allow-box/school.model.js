const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        schoolSuperAdmins: [
            {//staff with super admin access
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            }
        ],
        schoolAdmins: [
            { //staffs who has admin access
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        schoolSupportStaffs: [
            { //technical support
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        schoolClasses: [
            //classes under the school
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Class",
            },
        ],
        schoolTeachers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SuperAdmin",
            required: true,
        },
        isSchoolProfileCompleted: {
            type: Boolean,
            default: false,
        },
        paymentStatus: {
            type: Boolean,
            default: false,
        },
        lastPaymentDate: {
            type: Date,
            default: null,
        }
    }
);

schoolSchema.set("timestamps", true);
const School = mongoose.model("school", schoolSchema);

module.exports = School