const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
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

    title: {
        type: String,
        required: true,
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
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);