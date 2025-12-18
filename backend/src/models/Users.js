const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    code: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
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

module.exports = mongoose.model('User', usersSchema);
