const Classes = require('../models/Classes');
const Users = require('../models/Users');
const AttendanceRecords = require('../models/AttendanceRecords');
const mongoose = require('mongoose');

const getStudentTimetable = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const classes = await Classes.find({ students: studentId })
            .populate('teacherId', 'name');

        const timetable = classes.map(cls => ({
            classId: cls._id,
            subjectCode: cls.subjectCode,
            name: cls.name,
            classCode: cls.classCode,
            type: cls.type,
            teacher: {
                name: cls.teacherId?.name,
                email: cls.teacherId?.email
            },
            schedule: cls.schedule.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                room: s.room
            }))
        }));
        res.status(200).json({ timetable });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thời khóa biểu', error: error.message });
    }
};

const getInfoOfClasses = async (req, res) => {
    try {
        const { id: classId } = req.params;
        const cls = await Classes.findById(classId)
            .populate('students', 'name email code')
            .populate('teacherId', 'name email code');

        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        const classInfo = {
            classId: cls._id,
            subjectCode: cls.subjectCode,
            name: cls.name,
            classCode: cls.classCode,
            type: cls.type,
            semester: cls.semester,
            schedule: cls.schedule,
            teacher: {
                name: cls.teacherId?.name,
                email: cls.teacherId?.email,
                code: cls.teacherId?.code
            },
            students: cls.students.map(student => ({
                id: student._id,
                name: student.name,
                email: student.email,
                code: student.code
            }))
        };

        res.status(200).json({ classInfo });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sinh viên', error: error.message });
    }
}

module.exports = { getStudentTimetable, getInfoOfClasses };