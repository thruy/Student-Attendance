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
        type: String
    },

    createAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date
    },

    records: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        status: {
            type: String,
            enum: ['yes', 'no', 'na'],
            default: 'no'
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Attendances', attendancesSchema);
