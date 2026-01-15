require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/models/Users');
const Classes = require('../src/models/Classes');
const Attendances = require('../src/models/Attendances');

async function seedAttendance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB connected');
        const class160000 = await Classes.findOne({ classCode: '160000' });
        const class160001 = await Classes.findOne({ classCode: '160001' });
        if (!class160000 || !class160001) {
            throw new Error('Không tìm thấy class 160000 hoặc 160001');
        }
        const teacher160000 = class160000.teacherId;
        const teacher160001 = class160001.teacherId;
        const startDate160000 = new Date('2025-09-15');
        const startDate160001 = new Date('2025-09-18');
        let schedule = [];

        for (let i = 0; i < 16; i++) {
            const d = new Date(startDate160000);
            d.setDate(startDate160000.getDate() + i * 7);
            schedule.push(d);
        }
        const attendanceOfClass160000 = await Attendances.create({
            classId: class160000._id,
            teacherId: teacher160000,
            date: schedule,
            type: 'manual'
        });

        schedule = [];
        for (let i = 0; i < 16; i++) {
            const d = new Date(startDate160001);
            d.setDate(startDate160001.getDate() + i * 7);
            schedule.push(d);
        }
        const attendanceOfClass160001 = await Attendances.create({
            classId: class160001._id,
            teacherId: teacher160001,
            date: schedule,
            type: 'manual'
        });
        console.log('Tạo danh sách điểm danh thành công');
        process.exit(0);
    } catch (err) {
        console.error('Lỗi kết nối DB hoặc tạo danh sách điểm danh:', err);
        process.exit(1);
    }
}

seedAttendance();