const mongoose = require('mongoose');
require('dotenv').config();

const Attendance = require('../src/models/Attendances');
const Class = require('../src/models/Classes');
const User = require('../src/models/Users')

const attendance = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Kết nối DB thành công');

        const classData = await Class.findOne({ classCode: '160000' })
            .populate('students', '_id')
            .populate('teacherId', '_id');

        if (!classData) {
            throw new Error('❌ Không tìm thấy lớp có mã 160000');
        }

        const records = classData.students.map(student => ({
            studentId: student._id,
            status: 'yes'
        }));
        console.log("tạo record thành công");
        const attendance = new Attendance({
            classId: classData._id,
            teacherId: classData.teacherId,
            date: new Date('2025-09-15'),
            type: 'manual',
            records
        });

        await attendance.save();

        console.log('✅ Seed attendance thành công');
        process.exit(0);

    } catch (err) {
        console.error('❌ Lỗi seed attendance:', err);
        process.exit(1);
    }
};

attendance();
