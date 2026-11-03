const Classes = require('../models/Classes');
const Users = require('../models/Users');
const Projects = require('../models/Project');
const Attendances = require('../models/Attendances');
const mongoose = require('mongoose');
const {
    toDateKey, parseLocation, hasLocation, distanceInMeters, activeQrFilter, isQrActive
} = require('../utils/attendance');

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

// tìm phiên điểm danh theo token QR và kiểm tra sinh viên có thuộc lớp không
const findQrAttendance = async (token, studentId) => {
    if (!token || typeof token !== 'string') return { status: 400, message: 'Thiếu mã QR' };
    const attendance = await Attendances.findOne({ qrToken: token });
    if (!attendance) return { status: 404, message: 'Mã QR không hợp lệ' };

    const cls = await Classes.findById(attendance.classId).populate('teacherId', 'name');
    if (!cls) return { status: 404, message: 'Không tìm thấy lớp học' };
    if (!cls.students.some(id => String(id) === String(studentId))) {
        return { status: 403, message: 'Bạn không thuộc lớp học này' };
    }
    return { attendance, cls };
};

const getQrSessionInfo = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { attendance, cls, status, message } = await findQrAttendance(req.query.token, studentId);
        if (!attendance) { return res.status(status).json({ message }); }

        const record = attendance.records.find(r => String(r.studentId) === String(studentId));
        res.status(200).json({
            session: {
                subjectCode: cls.subjectCode,
                name: cls.name,
                classCode: cls.classCode,
                teacherName: cls.teacherId?.name,
                date: toDateKey(attendance.date),
                expiresAt: attendance.expiresAt,
                active: isQrActive(attendance),
                requiresLocation: hasLocation(attendance),
                alreadyCheckedIn: record?.status === 'yes'
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin phiên điểm danh', error: err.message });
    }
};

const checkInByQr = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { token, lat, lng, accuracy } = req.body;
        const { attendance, status, message } = await findQrAttendance(token, studentId);
        if (!attendance) { return res.status(status).json({ message }); }

        const now = new Date();
        if (!isQrActive(attendance, now)) {
            return res.status(410).json({ message: 'Phiên điểm danh đã kết thúc hoặc hết hạn' });
        }

        const record = attendance.records.find(r => String(r.studentId) === String(studentId));
        if (record?.status === 'yes') {
            return res.status(409).json({ message: 'Bạn đã điểm danh buổi học này rồi' });
        }

        const location = parseLocation(lat, lng, accuracy);
        let distance;
        if (hasLocation(attendance)) {
            if (!location) {
                return res.status(400).json({ message: 'Cần cho phép truy cập vị trí để điểm danh' });
            }
            distance = Math.round(distanceInMeters(attendance.location, location));
            if (distance > attendance.radius) {
                return res.status(403).json({
                    message: `Bạn đang ở ngoài phạm vi điểm danh (cách ${distance} m, cho phép ${attendance.radius} m)`
                });
            }
        }

        const studentObjectId = new mongoose.Types.ObjectId(studentId);
        // sinh viên được thêm vào lớp sau khi mở phiên chưa có trong danh sách
        if (!record) {
            await Attendances.updateOne(
                { _id: attendance._id, 'records.studentId': { $ne: studentObjectId } },
                { $push: { records: { studentId: studentObjectId, status: null } } }
            );
        }

        const update = {
            'records.$.status': 'yes',
            'records.$.method': 'qr',
            'records.$.checkInTime': now
        };
        if (location) update['records.$.location'] = location;
        if (distance !== undefined) update['records.$.distance'] = distance;

        // cập nhật nguyên tử để tránh ghi đè khi nhiều sinh viên điểm danh cùng lúc
        const result = await Attendances.updateOne(
            {
                _id: attendance._id,
                ...activeQrFilter(now),
                records: { $elemMatch: { studentId: studentObjectId, status: { $ne: 'yes' } } }
            },
            { $set: update }
        );
        if (result.modifiedCount === 0) {
            return res.status(409).json({ message: 'Bạn đã điểm danh buổi học này rồi hoặc phiên điểm danh đã kết thúc' });
        }

        res.status(200).json({ message: 'Điểm danh thành công', checkInTime: now, distance });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi điểm danh', error: err.message });
    }
};

module.exports = { getStudentTimetable, getInfoOfClasses, getStudentProjects, uploadReport, getQrSessionInfo, checkInByQr };