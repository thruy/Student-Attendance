const Classes = require('../models/Classes');
const Users = require('../models/Users');
const AttendanceRecords = require('../models/AttendanceRecords');
const Attendances = require('../models/Attendances');
const mongoose = require('mongoose');
const { text } = require('express');

const getTeacherTimetable = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const classes = await Classes.find({ teacherId });

        const timetable = classes.map(cls => ({
            classId: cls._id,
            subjectCode: cls.subjectCode,
            name: cls.name,
            classCode: cls.classCode,
            type: cls.type,
            numberOfStudents: cls.students.length,
            semester: cls.semester,
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

const getAttendancePageData = async (req, res) => {
    try {
        const { classId } = req.params;
        const cls = await Classes.findById(classId)
            .populate('teacherId', 'name email code')
            .populate('students', 'name email code')
        if (!cls) { return res.status(404).json({ message: 'Không tìm thấy lớp học' }); }

        const attendances = await Attendances.find({ classId: cls._id }).sort({ date: -1 });
        const dates = attendances.map(a => a.date.toISOString().split('T')[0]);

        const studentMap = {};
        cls.students.forEach(std => {
            studentMap[std._id] = {
                studentId: std._id,
                name: std.name,
                email: std.email,
                code: std.code,
                attendanceStatus: {}
            };
        });

        attendances.forEach(att => {
            const dateKey = att.date.toISOString().split('T')[0];
            att.records.forEach(record => {
                const studentId = record.studentId.toString();
                if (studentMap[studentId]) {
                    studentMap[studentId].attendance[dateKey] = record.status || null;
                }
            });
        })

        res.status(200).json({
            class: {
                classId: cls._id,
                subjectCode: cls.subjectCode,
                name: cls.name,
                classCode: cls.classCode,
                type: cls.type,
                semester: cls.semester,
                teacher: {
                    name: cls.teacherId?.name,
                    email: cls.teacherId?.email,
                    code: cls.teacherId?.code
                }
            },
            dates,
            students: Object.values(studentMap)
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin lớp học', error: err.message });
    }
}

module.exports = { getTeacherTimetable, getAttendancePageData };