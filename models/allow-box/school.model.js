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
        numberOfStudents: {
            type: Number,
        },
        subscriptionAmount: {
            type: Number,
        },
        subscriptionStartDate: {
            type: Date,
            default: null,
        },
        subscriptionEndDate: {
            type: Date,
            default: null,
        },
    }
);

schoolSchema.set("timestamps", true);
const School = mongoose.model("school", schoolSchema);

module.exports = School