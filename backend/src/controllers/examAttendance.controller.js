const User = require('../models/Users');
const Attendances = require('../models/Attendances');
const { findAccessibleExamRoom, examDateKey } = require('../utils/exam');
const {
    parseLocation, activeQrFilter, isQrActive, formatQrSession, parseQrMinutes, applyQrSession, mergeManualRecords
} = require('../utils/attendance');

const NO_PERMISSION = 'Chỉ cán bộ coi thi của lớp thi và admin mới được điểm danh';
const NOT_EXAM_DAY = 'Chỉ được điểm danh trong ngày thi';

const formatUser = (u) => ({ id: u._id, name: u.name, email: u.email, code: u.code });

// thông tin lớp thi + danh sách sinh viên + phiên điểm danh + quyền của người dùng (admin, giảng viên)
const getRoomAttendance = async (req, res) => {
    try {
        const { classId, examCode } = req.params;
        const { cls, room, permissions, status, message } = await findAccessibleExamRoom(classId, examCode, req.user);
        if (!room) { return res.status(status).json({ message }); }

        const [students, invigilators, attendance] = await Promise.all([
            User.find({ _id: { $in: room.students } }).select('_id name email code'),
            User.find({ _id: { $in: room.invigilators } }).select('_id name email code'),
            Attendances.findOne({ classId, examCode })
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

        let attendance = await Attendances.findOne({ classId, examCode });
        if (!attendance) {
            attendance = new Attendances({ classId, examCode, date: examDateKey(room), type: 'manual', records: [] });
        }
        attendance.records = mergeManualRecords(attendance.records, records);
        attendance.teacherId = req.user.userId;
        await attendance.save();

        res.status(200).json({ message: 'Lưu điểm danh thành công', attendance });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Phiên điểm danh vừa được tạo, vui lòng tải lại trang' });
        }
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
        let attendance = await Attendances.findOne({ classId, examCode });
        if (attendance && isQrActive(attendance, now)) {
            return res.status(200).json({ message: 'Phiên điểm danh QR đang diễn ra', session: formatQrSession(attendance, room.students.length) });
        }
        if (!attendance) {
            attendance = new Attendances({ classId, examCode, teacherId, date: examDateKey(room), records: [] });
        }

        applyQrSession(attendance, room.students, { teacherId, minutes, location, now });
        await attendance.save();

        res.status(201).json({ message: 'Đã tạo phiên điểm danh QR', session: formatQrSession(attendance, room.students.length) });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Phiên điểm danh vừa được tạo, vui lòng tải lại trang' });
        }
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

module.exports = { getRoomAttendance, saveRoomAttendance, startRoomQrSession, endRoomQrSession, deleteRoomAttendance };
