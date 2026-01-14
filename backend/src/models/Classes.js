const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        enum: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
        required: true
    },
    startTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/]
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/]
    },
    room: {
        type: String,
        required: true
    }
}, { _id: false });

const classesSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    classCode: {
        type: String,
        required: true,
        unique: true
    },

    type: {
        type: String,
        enum: ["theory", "exercise", "practice"],
        required: true
    },

    semester: {
        type: String,
        match: [/^\d+$/],
        length: 5,
        required: true
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],

    // 🔥 LỊCH HỌC GẮN TRONG CLASS
    schedule: [scheduleSchema]

}, {
    timestamps: true
});

module.exports = mongoose.model('Classes', classesSchema);