const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    attendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendances',
        required: true
    },

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },

    status: {
        type: Boolean,
        default: false
    },

    checkInTime: {
        type: Date
    },

    method: {
        type: String,
        enum: ['manual', 'qr', 'face']
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
