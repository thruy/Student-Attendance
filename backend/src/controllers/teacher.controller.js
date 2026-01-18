const Classes = require('../models/Classes');
const Users = require('../models/Users');
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

const saveAttendance = async (req, res) => {
    try {
        const { classId, date, records } = req.body;
        const teacherId = req.user.userId;
        if (!classId || !date || !records) { return res.status(400).json({ message: 'Thiếu dữ liệu điểm danh' }); }
        const cls = await Classes.findById(classId);
        if (!cls) { return res.status(404).json({ message: 'Không tìm thấy lớp học' }); }

        const validDate = cls.date.some(
            d => new Date(d).toISOString().split('T')[0] === date
        );
        if (!validDate) { return res.status(400).json({ message: 'Ngày không thuộc lịch học' }); }

        let attendance = await Attendances.findOne({ classId, date });
        if (!attendance) {
            attendance = await Attendances.create({
                classId,
                teacherId,
                date,
                records
            });
        } else {
            attendance.records = records;
            attendance.teacherId = teacherId;
            await attendance.save();
        }

        res.json({
            message: 'Lưu điểm danh thành công',
            attendance
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getTeacherTimetable, getAttendancePageData, saveAttendance };