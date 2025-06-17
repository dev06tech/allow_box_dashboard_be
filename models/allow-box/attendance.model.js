const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPresent: {
        type: Boolean,
        required: true
    },
    isHalfDay: {
        type: Boolean
    }
});
attendanceSchema.set("timestamps", true);

attendanceSchema.index({ userId: 1 });


const Attendance = mongoose.model("Attendance", attendanceSchema);


module.exports = Attendance