const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
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
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ],
    yearlyCLassFees: {
        type: Number,
        required: true
    }
});
ClassSchema.set("timestamps", true);

ClassSchema.index({ _id: 1 });

module.exports = mongoose.model("Class", ClassSchema);