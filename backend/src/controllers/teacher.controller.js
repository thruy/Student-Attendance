const Classes = require('../models/Classes');
const Users = require('../models/Users');
const AttendanceRecords = require('../models/AttendanceRecords');
const mongoose = require('mongoose');

const getTeacherTimetable = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const classes = await Classes.find({ teacherId: teacherId });

        const timetable = classes.map(cls => ({
            classId: cls._id,
            subjectCode: cls.subjectCode,
            name: cls.name,
            classCode: cls.classCode,
            type: cls.type,
            numberOfStudents: cls.students.length,
            schedule: cls.schedule.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                room: s.room
            }))
        }));
        res.status(200).json({ timetable });
    } catch {
        res.status(500).json({ message: 'Lỗi khi lấy thời khóa biểu', error: error.message });
    }
}

module.exports = { getTeacherTimetable };