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

        const attendances = await Attendances.find({ classId });
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
                },
                schedule: cls.schedule.map(s => ({
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    room: s.room
                })),
                date: cls.date.map(d => d.toISOString().split('T')[0]),
                students: cls.students.map(student => ({
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    code: student.code
                }))
            },
            attendances,
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin lớp học', error: err.message });
    }
}

const createAttendanceSession = async (req, res) => {
    try {
        const { classId, date } = req.body;
        const teacherId = req.user.userId;
        const existed = await Attendances.findOne({ classId, date });
        if (existed) {
            return res.status(400).json({ message: 'Buổi điểm danh đã tồn tại' });
        }

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        const attendance = await Attendances.create({
            classId,
            teacherId,
            date,
            records: cls.students.map(studentId => ({
                studentId,
                status: 'yes'
            })),
        });
        res.status(201).json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getTeacherTimetable, getAttendancePageData, createAttendanceSession };