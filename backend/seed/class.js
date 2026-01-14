require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/models/Users');
const Classes = require('../src/models/Classes');

async function seedClass() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB connected');

        const teacher = await User.findOne({ role: 'teacher', name: 'Trần Đức' });
        if (!teacher) {
            console.log('Không tìm thấy giáo viên');
            process.exit(1);
        }
        const teacher1 = await User.findOne({ role: 'teacher', name: 'Đức Huy' });

        const existingClass = await Classes.findOne({ classCode: '160000' });
        if (existingClass) {
            console.log('Lớp học đã tồn tại');
            process.exit(0);
        }

        const newClass = await Classes.create({
            subjectCode: 'IT4025',
            name: 'Mật mã ứng dụng',
            classCode: '160000',
            type: 'Lý thuyết',
            semester: '20251',
            teacherId: teacher._id,
            students: [],
            schedule: [
                {
                    dayOfWeek: 'Thứ Ba',
                    startTime: '06:45',
                    endTime: '10:05',
                    room: 'TC-201'
                }
            ]
        });
        const newClass1 = await Classes.create({
            subjectCode: 'IT4409',
            name: 'Lập trình Web',
            classCode: '160001',
            type: 'Lý thuyết',
            semester: '20251',
            teacherId: teacher1._id,
            students: [],
            schedule: [
                {
                    dayOfWeek: 'Thứ Năm',
                    startTime: '07:30',
                    endTime: '09:30',
                    room: 'D5-101'
                }
            ]
        });
        console.log('Tạo lớp học thành công');

        const students = await User.find({ role: 'student' }).limit(30);
        newClass.students = students.map(student => student._id);
        newClass1.students = students.map(student => student._id);

        await newClass1.save();
        await newClass.save();
        console.log(`Thêm ${students.length} sinh viên vào lớp học`);
        process.exit(0);
    } catch (error) {
        console.error('Lỗi seed class:', error.message);
        process.exit(1);
    }
}

seedClass();