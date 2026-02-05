const Classes = require('../models/Classes');
const Users = require('../models/Users');
const Projects = require('../models/Project');
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

const getStudentProjects = async (req, res) => {
    try {
        const studentId = req.user.userId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const semester = req.query.semester;
        if (semester) {
            filter.semester = semester;
        }
        const filter = { 'members.studentId': studentId };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { projectCode: { $regex: search, $options: 'i' } },
                { subjectCode: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Projects.countDocuments(filter);
        const projects = await Projects.find(filter)
            .select('subjectCode name projectCode teacherId members')
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // format data
        const formatted = projects.map(p => {
            const myMember = p.members.find(
                m => m.studentId.toString() === studentId
            );

            return {
                _id: p._id,
                subjectCode: p.subjectCode,
                name: p.name,
                projectCode: p.projectCode,
                teacher: p.teacherId,
                title: myMember?.title || null,
                score: myMember?.score ?? null,
                comment: myMember?.comment ?? null
            };
        });

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

module.exports = { getStudentTimetable, getInfoOfClasses, getStudentProjects, uploadReport };