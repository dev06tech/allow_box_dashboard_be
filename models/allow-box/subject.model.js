const mongoose = require("mongoose");
const { assign } = require("nodemailer/lib/shared");

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    associatedSchool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
    },
    assignedTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

subjectSchema.set("timestamps", true);

subjectSchema.index({ _id: 1 });

module.exports = mongoose.model("Subject", subjectSchema);