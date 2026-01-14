const Classes = require('../models/Classes');
const Users = require('../models/Users');
const Schedules = require('../models/Schedules');
const AttendanceRecords = require('../models/AttendanceRecords');
const mongoose = require('mongoose');

const getStudentTimetable = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const student = await Users.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }
        const classes = await Classes.find({ students: studentId });
        const timetable = await Promise.all(classes.map(async (cls) => {
            const schedules = await Schedules.find({ classId: cls._id });
            return {
                className: cls.name,
                subjectCode: cls.subjectCode,
                classCode: cls.classCode,
                type: cls.type,
                schedules: schedules.map(schedule => ({
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    room: schedule.room
                }))
            };
        }));
        res.status(200).json({ timetable });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thời khóa biểu', error });
    }
}

const getStudentOfClasses = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const student = await Users.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }
        const studentInClasses = await Classes.find({ students: studentId });
        res.status(200).json({ studentInClasses });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách lớp', error });
    }
}

module.exports = { getStudentTimetable, getStudentOfClasses };