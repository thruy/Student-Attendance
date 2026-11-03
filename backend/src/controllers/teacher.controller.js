const Classes = require('../models/Classes');
const Users = require('../models/Users');
const Attendances = require('../models/Attendances');
const Projects = require('../models/Project');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { text } = require('express');
const {
    getQrConfig, todayInVN, parseLocation, activeQrFilter, isQrActive, formatQrSession, mergeManualRecords
} = require('../utils/attendance');

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
        const activeQr = attendances.find(a => isQrActive(a));
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
            qrSession: activeQr ? formatQrSession(activeQr, cls.students.length) : null
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
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date))) { return res.status(400).json({ message: 'Ngày điểm danh không hợp lệ' }); }
        const cls = await Classes.findById(classId);
        if (!cls) { return res.status(404).json({ message: 'Không tìm thấy lớp học' }); }

        let attendance = await Attendances.findOne({ classId, date });
        if (!attendance) {
            attendance = await Attendances.create({
                classId,
                teacherId,
                date,
                type,
                records: mergeManualRecords([], records)
            });
        } else {
            attendance.records = mergeManualRecords(attendance.records, records);
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

const findTeacherClass = async (classId, teacherId) => {
    if (!mongoose.isValidObjectId(classId)) return { status: 404, message: 'Không tìm thấy lớp học' };
    const cls = await Classes.findById(classId);
    if (!cls) return { status: 404, message: 'Không tìm thấy lớp học' };
    if (String(cls.teacherId) !== String(teacherId)) return { status: 403, message: 'Bạn không phụ trách lớp học này' };
    return { cls };
};

const startQrSession = async (req, res) => {
    try {
        const { classId } = req.params;
        const { date, lat, lng, accuracy, duration } = req.body;
        const teacherId = req.user.userId;

        const { cls, status, message } = await findTeacherClass(classId, teacherId);
        if (!cls) { return res.status(status).json({ message }); }

        const today = todayInVN();
        if (date && date !== today) { return res.status(400).json({ message: 'Chỉ được điểm danh QR cho ngày hôm nay' }); }

        const location = parseLocation(lat, lng, accuracy);
        if ((lat != null || lng != null) && !location) { return res.status(400).json({ message: 'Tọa độ không hợp lệ' }); }

        const config = getQrConfig();
        const minutes = duration === undefined ? config.minutes : Number(duration);
        if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
            return res.status(400).json({ message: 'Thời gian hiệu lực phải từ 1 đến 180 phút' });
        }

        const now = new Date();
        let attendance = await Attendances.findOne({ classId, date: today });
        if (attendance && isQrActive(attendance, now)) {
            return res.status(200).json({ message: 'Phiên điểm danh QR đang diễn ra', session: formatQrSession(attendance, cls.students.length) });
        }
        if (!attendance) {
            attendance = new Attendances({ classId, teacherId, date: today, records: [] });
        }

        // thêm sinh viên chưa có trong danh sách, giữ nguyên kết quả đã điểm danh trước đó
        const existingIds = new Set(attendance.records.map(r => String(r.studentId)));
        cls.students.forEach(studentId => {
            if (!existingIds.has(String(studentId))) attendance.records.push({ studentId, status: null });
        });

        attendance.type = 'qr';
        attendance.teacherId = teacherId;
        attendance.qrToken = crypto.randomBytes(24).toString('base64url');
        attendance.expiresAt = new Date(now.getTime() + minutes * 60 * 1000);
        attendance.endedAt = null;
        attendance.location = location || undefined;
        attendance.radius = location ? config.radius : undefined;
        await attendance.save();

        res.status(201).json({ message: 'Đã tạo phiên điểm danh QR', session: formatQrSession(attendance, cls.students.length) });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tạo phiên điểm danh', error: err.message });
    }
};

const endQrSession = async (req, res) => {
    try {
        const { classId } = req.params;
        const { cls, status, message } = await findTeacherClass(classId, req.user.userId);
        if (!cls) { return res.status(status).json({ message }); }

        const active = await Attendances.findOne({ classId, ...activeQrFilter() });
        if (!active) { return res.status(404).json({ message: 'Không có phiên điểm danh QR nào đang diễn ra' }); }

        active.endedAt = new Date();
        await active.save();
        res.status(200).json({ message: 'Đã kết thúc phiên điểm danh QR' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi kết thúc phiên điểm danh', error: err.message });
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
    getTeacherTimetable, getAttendancePageData, saveAttendance, startQrSession, endQrSession,
    getAllProjects, getProjectDetail, uploadReport, gradeStudent, updateTitleForStudent
};