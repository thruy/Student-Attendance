require('dotenv').config();
const mongoose = require('mongoose');

const Classes = require('../src/models/Classes');
const Attendances = require('../src/models/Attendances');

async function seedAttendance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB connected');
        const classes = await Classes.find({
            classCode: { $in: ['160000', '160001'] }
        });
        if (classes.length === 0) {
            throw new Error('Không tìm thấy lớp học');
        }

        for (const cls of classes) {
            const startDate = cls.classCode === '160000' ? new Date('2025-09-15') : new Date('2025-09-18');
            for (let i = 0; i < 16; i++) {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i * 7);
                const existed = await Attendances.findOne({ classId: cls._id, date: d });
                if (existed) {
                    console.log(`Danh sách điểm danh cho lớp ${cls.classCode} vào ngày ${d.toISOString().split('T')[0]} đã tồn tại`);
                    continue;
                }

                await Attendances.create({
                    classId: cls._id,
                    teacherId: cls.teacherId,
                    date: d,
                    type: 'manual',
                    records: cls.students.map(studentId => ({
                        studentId
                    }))
                });
            }
        }
        console.log('Tạo danh sách điểm danh thành công');
        process.exit(0);
    } catch (err) {
        console.error('Lỗi kết nối DB hoặc tạo danh sách điểm danh:', err);
        process.exit(1);
    }
}

seedAttendance();