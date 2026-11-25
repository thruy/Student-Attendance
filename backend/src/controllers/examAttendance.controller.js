const mongoose = require('mongoose');
const User = require('../models/Users');
const Attendances = require('../models/Attendances');
const { findAccessibleExamRoom, examDateKey } = require('../utils/exam');
const {
    parseLocation, activeQrFilter, isQrActive, formatQrSession, parseQrMinutes, applyQrSession, mergeManualRecords
} = require('../utils/attendance');
const { requestEmbedding, findBestMatch, faceMatches, isComparable } = require('../utils/face');
const { sendFaceError } = require('./face.controller');

const NO_PERMISSION = 'Chỉ cán bộ coi thi của lớp thi và admin mới được điểm danh';
const NOT_EXAM_DAY = 'Chỉ được điểm danh trong ngày thi';

const formatUser = (u) => ({ id: u._id, name: u.name, email: u.email, code: u.code });

// lấy phiên điểm danh của lớp thi, chưa có thì tạo (danh sách lấy từ lớp thi, chưa điểm danh)
// upsert nguyên tử; 2 request cùng tạo có thể đụng unique index, khi đó đọc lại document đã có
const findOrCreateRoomAttendance = async ({ classId, examCode, room, teacherId, type }) => {
    const filter = { classId, examCode };
    try {
        return await Attendances.findOneAndUpdate(
            filter,
            {
                // classId, examCode lấy từ filter khi tạo mới
                $setOnInsert: {
                    teacherId, type,
                    date: examDateKey(room),
                    records: room.students.map(studentId => ({ studentId, status: null }))
                }
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
    } catch (err) {
        if (err.code === 11000) return Attendances.findOne(filter);
        throw err;
    }
};

// thông tin lớp thi + danh sách sinh viên + phiên điểm danh + quyền của người dùng (admin, giảng viên)
const getRoomAttendance = async (req, res) => {
    try {
        const { classId, examCode } = req.params;
        const { cls, room, permissions, status, message } = await findAccessibleExamRoom(classId, examCode, req.user);
        if (!room) { return res.status(status).json({ message }); }

        const [students, invigilators, attendance, faceRegisteredCount] = await Promise.all([
            User.find({ _id: { $in: room.students } }).select('_id name email code'),
            User.find({ _id: { $in: room.invigilators } }).select('_id name email code'),
            Attendances.findOne({ classId, examCode }),
            User.countDocuments({ _id: { $in: room.students }, 'faceData.embedding.0': { $exists: true } })
        ]);

        res.status(200).json({
            class: {
                classId: cls._id,
                subjectCode: cls.subjectCode,
                name: cls.name,
                classCode: cls.classCode,
                semester: cls.semester
            },
            room: {
                examCode: room.examCode,
                room: room.room,
                startTime: room.startTime,
                endTime: room.endTime,
                date: examDateKey(room),
                invigilators: invigilators.map(formatUser)
            },
            students: students.map(formatUser),
            attendance,
            qrSession: attendance && isQrActive(attendance) ? formatQrSession(attendance, room.students.length) : null,
            faceRegisteredCount,
            permissions
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin điểm danh lớp thi', error: err.message });
    }
};

// điểm danh thủ công cho lớp thi
const saveRoomAttendance = async (req, res) => {
    try {
        const { classId, examCode } = req.params;
        const { records } = req.body;
        const { room, canEdit, permissions, status, message } = await findAccessibleExamRoom(classId, examCode, req.user);
        if (!room) { return res.status(status).json({ message }); }
        if (!canEdit) { return res.status(403).json({ message: NO_PERMISSION }); }
        if (!permissions.manual) { return res.status(403).json({ message: NOT_EXAM_DAY }); }

        if (!Array.isArray(records)) { return res.status(400).json({ message: 'Thiếu dữ liệu điểm danh' }); }
        const roomStudentIds = new Set(room.students.map(String));
        if (records.some(r => !roomStudentIds.has(String(r?.studentId)))) {
            return res.status(400).json({ message: 'Có sinh viên không thuộc lớp thi' });
        }
        if (records.some(r => !['yes', 'no', null].includes(r.status))) {
            return res.status(400).json({ message: 'Trạng thái điểm danh không hợp lệ' });
        }

        const teacherId = req.user.userId;
        const attendance = await findOrCreateRoomAttendance({ classId, examCode, room, teacherId, type: 'manual' });
        attendance.records = mergeManualRecords(attendance.records, records);
        attendance.teacherId = teacherId;
        await attendance.save();

        res.status(200).json({ message: 'Lưu điểm danh thành công', attendance });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lưu điểm danh lớp thi', error: err.message });
    }
};

const startRoomQrSession = async (req, res) => {
    try {
        const { classId, examCode } = req.params;
        const { lat, lng, accuracy, duration } = req.body;
        const teacherId = req.user.userId;
        const { room, canEdit, permissions, status, message } = await findAccessibleExamRoom(classId, examCode, req.user);
        if (!room) { return res.status(status).json({ message }); }
        if (!canEdit) { return res.status(403).json({ message: NO_PERMISSION }); }
        if (!permissions.qr) { return res.status(403).json({ message: NOT_EXAM_DAY }); }

        const location = parseLocation(lat, lng, accuracy);
        if ((lat != null || lng != null) && !location) { return res.status(400).json({ message: 'Tọa độ không hợp lệ' }); }

        const minutes = parseQrMinutes(duration);
        if (!minutes) { return res.status(400).json({ message: 'Thời gian hiệu lực phải từ 1 đến 180 phút' }); }

        const now = new Date();
        const attendance = await findOrCreateRoomAttendance({ classId, examCode, room, teacherId, type: 'qr' });
        if (isQrActive(attendance, now)) {
            return res.status(200).json({ message: 'Phiên điểm danh QR đang diễn ra', session: formatQrSession(attendance, room.students.length) });
        }

        applyQrSession(attendance, room.students, { teacherId, minutes, location, now });
        await attendance.save();

        res.status(201).json({ message: 'Đã tạo phiên điểm danh QR', session: formatQrSession(attendance, room.students.length) });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tạo phiên điểm danh', error: err.message });
    }
};

const endRoomQrSession = async (req, res) => {
    try {
        const { classId, examCode } = req.params;
        const { room, canEdit, status, message } = await findAccessibleExamRoom(classId, examCode, req.user);
        if (!room) { return res.status(status).json({ message }); }
        if (!canEdit) { return res.status(403).json({ message: NO_PERMISSION }); }

        const active = await Attendances.findOne({ classId, examCode, ...activeQrFilter() });
        if (!active) { return res.status(404).json({ message: 'Không có phiên điểm danh QR nào đang diễn ra' }); }

        active.endedAt = new Date();
        await active.save();
        res.status(200).json({ message: 'Đã kết thúc phiên điểm danh QR' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi kết thúc phiên điểm danh', error: err.message });
    }
};

// điểm danh bằng khuôn mặt: camera của cán bộ coi thi gửi 1 khung hình, so với ảnh đăng ký của sinh viên trong lớp thi
// không khớp vẫn trả 200 (matched: false) để camera tiếp tục chụp; ảnh chụp không được lưu lại
const faceCheckIn = async (req, res) => {
    try {
        const { classId, examCode } = req.params;
        const teacherId = req.user.userId;
        const { room, canEdit, permissions, status, message } = await findAccessibleExamRoom(classId, examCode, req.user);
        if (!room) { return res.status(status).json({ message }); }
        if (!canEdit) { return res.status(403).json({ message: NO_PERMISSION }); }
        if (!permissions.face) { return res.status(403).json({ message: NOT_EXAM_DAY }); }

        const result = await requestEmbedding(req.file.buffer, { antiSpoofing: true });

        const students = await User.find({ _id: { $in: room.students } }).select('+faceData name code');
        const candidates = students
            .filter(s => isComparable(s.faceData, result))
            .map(s => ({ user: s, embedding: s.faceData.embedding }));
        const match = findBestMatch(result.embedding, candidates);
        const distance = Number.isFinite(match.distance) ? Number(match.distance.toFixed(4)) : null;
        if (!faceMatches(match)) {
            return res.status(200).json({ matched: false, distance, message: 'Không nhận diện được sinh viên thuộc lớp thi' });
        }

        const student = match.best.user;
        const studentId = new mongoose.Types.ObjectId(String(student._id));
        const attendance = await findOrCreateRoomAttendance({ classId, examCode, room, teacherId, type: 'face' });

        // sinh viên chưa có trong danh sách điểm danh (phòng hợp lệ nhưng phiên tạo trước đó thiếu)
        if (!attendance.records.some(r => String(r.studentId) === String(studentId))) {
            await Attendances.updateOne(
                { _id: attendance._id, 'records.studentId': { $ne: studentId } },
                { $push: { records: { studentId, status: null } } }
            );
        }

        // cập nhật nguyên tử, giống điểm danh QR
        const now = new Date();
        const updated = await Attendances.updateOne(
            { _id: attendance._id, records: { $elemMatch: { studentId, status: { $ne: 'yes' } } } },
            {
                $set: {
                    teacherId,
                    'records.$.status': 'yes',
                    'records.$.method': 'face',
                    'records.$.checkInTime': now,
                    'records.$.distance': distance
                }
            }
        );

        res.status(200).json({
            matched: true,
            alreadyCheckedIn: updated.modifiedCount === 0,
            student: { id: student._id, name: student.name, code: student.code },
            distance,
            message: updated.modifiedCount === 0
                ? `${student.name} đã được điểm danh trước đó`
                : `Điểm danh thành công: ${student.name}`
        });
    } catch (err) {
        sendFaceError(res, err, 'Lỗi khi điểm danh bằng khuôn mặt');
    }
};

// xóa phiên điểm danh của lớp thi (chỉ admin, giống xóa phiên điểm danh buổi học)
// xóa hết phiên điểm danh thi của lớp thì danh sách lớp thi được mở khóa
const deleteRoomAttendance = async (req, res) => {
    try {
        const { classId, examCode } = req.params;
        const { room, status, message } = await findAccessibleExamRoom(classId, examCode, req.user);
        if (!room) { return res.status(status).json({ message }); }

        const result = await Attendances.deleteOne({ classId, examCode });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phiên điểm danh' });
        }
        res.status(200).json({ message: 'Đã xóa phiên điểm danh lớp thi thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa phiên điểm danh lớp thi', error: err.message });
    }
};

module.exports = {
    getRoomAttendance, saveRoomAttendance, startRoomQrSession, endRoomQrSession, faceCheckIn, deleteRoomAttendance
};
