const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },

    title: {
        type: String,
        trim: true,
        default: null
    },

    fileUrl: {
        type: String,
        default: null
    },

    originalFileName: {
        type: String,
        default: null
    },

    score: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },

    comment: {
        type: String,
        trim: true,
        default: null
    },

    submittedAt: {
        type: Date,
        default: null
    }
}, { _id: false });

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

    members: [projectMemberSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);