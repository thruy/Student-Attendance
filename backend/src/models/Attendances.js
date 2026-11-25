const mongoose = require('mongoose');

const attendancesSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes',
        required: true
    },

    // null = buổi học của lớp, có giá trị = phiên điểm danh của lớp thi (phòng thi) có mã tương ứng
    examCode: {
        type: String,
        default: null
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    type: {
        type: String,
        enum: ['manual', 'qr', 'face'],
        required: true
    },

    qrToken: {
        type: String,
        index: true
    },

    createAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date
    },

    // phiên QR đang hoạt động khi: có qrToken, endedAt = null và expiresAt > hiện tại
    endedAt: {
        type: Date,
        default: null
    },

    // vị trí giảng viên lúc mở phiên QR, không có thì bỏ qua kiểm tra vị trí
    location: {
        lat: { type: Number },
        lng: { type: Number },
        accuracy: { type: Number }
    },

    radius: {
        type: Number
    },

    records: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        status: {
            type: String,
            enum: ['yes', 'no', null],
            default: null
        },
        method: {
            type: String,
            enum: ['manual', 'qr', 'face']
        },
        checkInTime: {
            type: Date
        },
        location: {
            lat: { type: Number },
            lng: { type: Number },
            accuracy: { type: Number }
        },
        distance: {
            type: Number
        }
    }]
}, {
    timestamps: true
});

// mỗi lớp thi có đúng một phiên điểm danh
attendancesSchema.index(
    { classId: 1, examCode: 1 },
    { unique: true, partialFilterExpression: { examCode: { $type: 'string' } } }
);

module.exports = mongoose.model('Attendances', attendancesSchema);
