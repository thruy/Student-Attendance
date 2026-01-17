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
        const dates0 = [], dates1 = [];
        const startDate0 = new Date('2025-09-15');
        const startDate1 = new Date('2025-09-18');
        for (let i = 0; i < 16; i++) {
            const d0 = new Date(startDate0);
            const d1 = new Date(startDate1);
            d0.setDate(d0.getDate() + i * 7);
            d1.setDate(d1.getDate() + i * 7);
            dates0.push(d0);
            dates1.push(d1);
        }

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
            date: [],
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
            date: [],
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
        newClass.date = dates0;
        newClass1.date = dates1;

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