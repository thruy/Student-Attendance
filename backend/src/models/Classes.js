const mongoose = require('mongoose');

const classesSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["theory", "exercise", "practice"],
        required: true
    },

    semester: {
        type: String,
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
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model('Classes', classesSchema);
