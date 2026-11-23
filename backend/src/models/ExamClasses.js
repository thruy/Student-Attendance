const mongoose = require('mongoose');

const examRoomSchema = new mongoose.Schema({
    examCode: {
        type: String,
        required: true
    },

    room: {
        type: String,
        required: true
    },

    startTime: {
        type: Date,
        required: true
    },

    endTime: {
        type: Date,
        required: true
    },

    // cán bộ coi thi, chọn từ danh sách giảng viên
    invigilators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }]
}, { _id: false });

// mỗi lớp học có đúng 1 đợt thi, các lớp thi nhúng trong rooms[]
const examClassesSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classes',
        required: true,
        unique: true
    },

    maxPerRoom: {
        type: Number,
        required: true,
        min: 1
    },

    rooms: [examRoomSchema],

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
}, {
    timestamps: true
});

// sinh viên tra cứu lớp thi của mình
examClassesSchema.index({ 'rooms.students': 1 });

module.exports = mongoose.model('ExamClasses', examClassesSchema);
