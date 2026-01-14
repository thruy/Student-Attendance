require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/models/Users');
const Classes = require('../src/models/Classes');
const Schedules = require('../src/models/Schedules');

async function seedClass() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB connected');

        const teacher = await User.findOne({ role: 'teacher' });
        if (!teacher) {
            console.log('Không tìm thấy giáo viên');
            process.exit(1);
        }

        const existingClass = await Classes.findOne({ classCode: '160000' });
        if (existingClass) {
            console.log('Lớp học đã tồn tại');
            process.exit(0);
        }

        const newClass = await Classes.create({
            subjectCode: 'IT4409',
            name: 'Lập trình Web',
            classCode: '160000',
            type: 'theory',
            semester: '20251',
            teacherId: teacher._id,
            students: []
        });
        console.log('Tạo lớp học thành công');

        const schedules = await Schedules.insertMany([{
            classId: newClass._id,
            dayOfWeek: 'Thứ Hai',
            startTime: '07:30',
            endTime: '09:30',
            room: 'D3-101'
        }
        ]);
        console.log(`Tạo ${schedules.length} buổi học`);

        const students = await User.find({ role: 'student' }).limit(30);
        newClass.students = students.map(student => student._id);
        await newClass.save();
        console.log(`Thêm ${students.length} sinh viên vào lớp học`);
        process.exit(0);
    } catch (error) {
        console.error('Lỗi seed class:', error.message);
        process.exit(1);
    }
}

seedClass();