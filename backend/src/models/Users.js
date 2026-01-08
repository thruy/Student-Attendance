const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2
    },

    code: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d+$/]
    },

    email: {
        type: String,
        required: true,
        match: [/^[a-zA-Z]+\.[a-zA-Z]+\d{6}@sis\.hust\.edu\.vn$/, "Định dạng email không hợp lệ."],
        unique: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
        required: true
    },

    dob: {
        type: Date,
        required: true
    },

    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Khác'],
        required: true
    },

    ethnic: {
        type: String
    },

    university: {
        type: String,
        default: 'Đại học Bách Khoa Hà Nội',
        required: true
    },

    school: {
        type: String
    },

    branch: {
        type: String
    },

    className: {
        type: String
    },

    schoolYear: {
        type: Number
    },

    trainingSystem: {
        type: String,
        enum: ['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ']
    },

    hometown: {
        type: String
    },

    identificationNumber: {
        type: String,
        match: [/^\d+$/]
    },

    phone: {
        type: String,
        minlength: 10,
        match: [/^\d+$/]
    },

    faceData: {
        embeddings: {
            type: [Number]
        },
        registeredAt: {
            type: Date
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Users', usersSchema);
