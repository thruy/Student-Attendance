const mongoose = require('mongoose');

const schedulesSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes',
        required: true
    },

    dayOfWeek: {
        type: String,
        enum: ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
        required: true
    },

    startTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng thời gian không hợp lệ. Vui lòng sử dụng định dạng HH:MM (24 giờ)."]
    },

    endTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng thời gian không hợp lệ. Vui lòng sử dụng định dạng HH:MM (24 giờ)."]
    },

    room: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Schedules', schedulesSchema);