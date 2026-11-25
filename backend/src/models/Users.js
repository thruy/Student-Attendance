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

    // ảnh khuôn mặt sinh viên tự tải lên để điểm danh; dữ liệu sinh trắc học nên mặc định không trả về
    // lấy ra bằng .select('+faceData'), photoPath là đường dẫn nội bộ trên server (không public)
    faceData: {
        type: new mongoose.Schema({
            embedding: { type: [Number] },
            // embedding chỉ so được với embedding cùng mô hình và bộ phát hiện
            model: { type: String },
            detector: { type: String },
            photoPath: { type: String },
            registeredAt: { type: Date }
        }, { _id: false }),
        select: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Users', usersSchema);
