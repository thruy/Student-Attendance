const Classes = require('../models/Classes');
const Users = require('../models/Users');
const Attendances = require('../models/Attendances');
const Projects = require('../models/Project');
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
        const { classId, date, type, records } = req.body;
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
                type,
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

const getAllProjects = async (req, res) => {
    try {
        const teacherId = req.user.userId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const filter = { teacherId };

        if (search) {
            filter.$or = [
                { subjectCode: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { projectCode: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Projects.countDocuments(filter);
        const projects = await Projects.find(filter)
            .select('subjectCode name projectCode members')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const formatted = projects.map(p => ({
            _id: p._id,
            subjectCode: p.subjectCode,
            name: p.name,
            projectCode: p.projectCode,
            studentCount: p.members.length
        }));

        res.status(200).json({
            projects: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getProjectDetail = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Projects.findById(projectId)
            .populate('teacherId', 'name email code')
            .populate('members.studentId', 'name email code');

        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project' });
        }
        res.json({ project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const uploadReport = async (req, res) => {
    try {
        const { projectId } = req.params;
        const studentId = req.user.userId;
        const fileUrl = req.file.path;

        const project = await Projects.findOneAndUpdate(
            { _id: projectId, 'members.studentId': studentId },
            { $set: { 'members.$.fileUrl': fileUrl } },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy project hoặc sinh viên' });
        }
        res.json({ message: 'Upload thành công', fileUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const gradeStudent = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const { score, comment } = req.body;

        const project = await Projects.findOneAndUpdate(
            { _id: projectId, 'members.studentId': studentId },
            {
                $set: {
                    'members.$.score': score,
                    'members.$.comment': comment
                }
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên trong project' });
        }

        res.json({ message: 'Chấm điểm thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateTitleForStudent = async (req, res) => {
    try {
        const { projectId, studentId } = req.params;
        const { title } = req.body;
        const project = await Projects.findOneAndUpdate(
            { _id: projectId, 'members.studentId': studentId },
            { $set: { 'members.$.title': title } },
            { new: true }
        );
        if (!project) {
            return res.status(404).json({ message: 'Không tìm thấy lớp đồ án' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getTeacherTimetable, getAttendancePageData, saveAttendance,
    getAllProjects, getProjectDetail, uploadReport, gradeStudent, updateTitleForStudent
};