const mongoose = require('mongoose');
const crypto = require('crypto');
const Classes = require('../models/Classes');
const Attendances = require('../models/Attendances');
const { formatClassDetail, findAccessibleClass } = require('../utils/class');
const {
    getQrConfig, todayInVN, toDateKey, parseLocation, hasLocation, distanceInMeters,
    activeQrFilter, isQrActive, formatQrSession, mergeManualRecords
} = require('../utils/attendance');

// thông tin lớp + toàn bộ phiên điểm danh + phiên QR đang chạy (admin, giảng viên)
const getClassAttendance = async (req, res) => {
    try {
        const { classId } = req.params;
        const { cls, status, message } = await findAccessibleClass(classId, req.user, { populate: true });
        if (!cls) { return res.status(status).json({ message }); }

        const attendances = await Attendances.find({ classId });
        const activeQr = attendances.find(a => isQrActive(a));
        res.status(200).json({
            class: formatClassDetail(cls),
            attendances,
            qrSession: activeQr ? formatQrSession(activeQr, cls.students.length) : null
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin lớp học', error: err.message });
    }
};

// điểm danh thủ công cho một ngày bất kỳ
const saveAttendance = async (req, res) => {
    try {
        const { classId, date, type, records } = req.body;
        const teacherId = req.user.userId;
        if (!classId || !date || !records) { return res.status(400).json({ message: 'Thiếu dữ liệu điểm danh' }); }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date))) { return res.status(400).json({ message: 'Ngày điểm danh không hợp lệ' }); }
        const { cls, status, message } = await findAccessibleClass(classId, req.user);
        if (!cls) { return res.status(status).json({ message }); }

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

const deleteAttendance = async (req, res) => {
    try {
        const { classId, date } = req.params;
        const { cls, status, message } = await findAccessibleClass(classId, req.user);
        if (!cls) { return res.status(status).json({ message }); }

        const attendance = await Attendances.findOne({ classId, date });
        if (!attendance) {
            return res.status(404).json({ message: 'Không tìm thấy phiên điểm danh' });
        }

        await attendance.deleteOne();
        res.status(200).json({
            message: 'Đã xóa phiên điểm danh thành công'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===== điểm danh QR: giảng viên =====

const startQrSession = async (req, res) => {
    try {
        const { classId } = req.params;
        const { date, lat, lng, accuracy, duration } = req.body;
        const teacherId = req.user.userId;

        const { cls, status, message } = await findAccessibleClass(classId, req.user);
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
        const { cls, status, message } = await findAccessibleClass(classId, req.user);
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

// ===== điểm danh QR: sinh viên =====

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

module.exports = {
    getClassAttendance, saveAttendance, deleteAttendance,
    startQrSession, endQrSession, getQrSessionInfo, checkInByQr
};
