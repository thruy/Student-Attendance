const mongoose = require('mongoose');

const attendancesSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes',
        required: true
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

module.exports = mongoose.model('Attendances', attendancesSchema);
