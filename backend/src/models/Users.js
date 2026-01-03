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
        unique: true
    },

    email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
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
        enum: ['male', 'female', 'others'],
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

    schoolYear: {
        type: Number
    },

    trainingSystem: {
        type: String,
        enum: ['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ']
    },

    branch: {
        type: String
    },

    class: {
        type: String
    },

    hometown: {
        type: String
    },

    identificationNumber: {
        type: String
    },

    phone: {
        type: String,
        minlength: 10
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
