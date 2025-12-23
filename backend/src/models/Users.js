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
        required: true
    },

    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
        required: true
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
