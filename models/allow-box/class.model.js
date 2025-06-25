const mongoose = require("mongoose");

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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ],
    yearlyCLassFees: {
        type: Number,
        required: true
    }
});
classSchema.set("timestamps", true);

module.exports = mongoose.model("Class", classSchema);