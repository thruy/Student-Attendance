const crypto = require('crypto');

const DEFAULT_QR_MINUTES = 5;
const DEFAULT_QR_RADIUS = 50; // mét

const getQrConfig = () => ({
    minutes: Number(process.env.QR_SESSION_MINUTES) || DEFAULT_QR_MINUTES,
    radius: Number(process.env.QR_RADIUS_METERS) || DEFAULT_QR_RADIUS,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
});

// ngày theo giờ Việt Nam, dạng YYYY-MM-DD (cùng định dạng với ngày lưu trong DB)
const dateKeyInVN = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(date));

const todayInVN = () => dateKeyInVN();

const toDateKey = (date) => new Date(date).toISOString().split('T')[0];

const parseLocation = (lat, lng, accuracy) => {
    if (lat === undefined || lat === null || lng === undefined || lng === null) return null;
    const location = { lat: Number(lat), lng: Number(lng) };
    if (!Number.isFinite(location.lat) || location.lat < -90 || location.lat > 90) return null;
    if (!Number.isFinite(location.lng) || location.lng < -180 || location.lng > 180) return null;
    if (Number.isFinite(Number(accuracy)) && Number(accuracy) >= 0) location.accuracy = Number(accuracy);
    return location;
};

const hasLocation = (attendance) => attendance.location?.lat != null && attendance.location?.lng != null;

// khoảng cách giữa 2 tọa độ (mét), công thức Haversine
const distanceInMeters = (a, b) => {
    const R = 6371000;
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
};

const activeQrFilter = (now = new Date()) => ({
    qrToken: { $exists: true, $ne: null },
    endedAt: null,
    expiresAt: { $gt: now }
});

const isQrActive = (attendance, now = new Date()) =>
    !!attendance.qrToken && !attendance.endedAt && !!attendance.expiresAt && attendance.expiresAt > now;

const formatQrSession = (attendance, totalStudents) => ({
    attendanceId: attendance._id,
    date: toDateKey(attendance.date),
    expiresAt: attendance.expiresAt,
    qrUrl: `${getQrConfig().frontendUrl}/attendance/verify?token=${attendance.qrToken}`,
    checkedIn: attendance.records.filter(r => r.status === 'yes').length,
    total: totalStudents,
    hasLocation: hasLocation(attendance),
    radius: attendance.radius
});

// thời gian hiệu lực phiên QR (phút), không hợp lệ trả về null
const parseQrMinutes = (duration) => {
    const minutes = duration === undefined ? getQrConfig().minutes : Number(duration);
    return Number.isInteger(minutes) && minutes >= 1 && minutes <= 180 ? minutes : null;
};

// mở phiên QR mới trên attendance (chưa save): thêm sinh viên chưa có trong danh sách, giữ nguyên kết quả đã điểm danh trước đó
const applyQrSession = (attendance, studentIds, { teacherId, minutes, location, now = new Date() }) => {
    const existingIds = new Set(attendance.records.map(r => String(r.studentId)));
    studentIds.forEach(studentId => {
        if (!existingIds.has(String(studentId))) attendance.records.push({ studentId, status: null });
    });

    attendance.type = 'qr';
    attendance.teacherId = teacherId;
    attendance.qrToken = crypto.randomBytes(24).toString('base64url');
    attendance.expiresAt = new Date(now.getTime() + minutes * 60 * 1000);
    attendance.endedAt = null;
    attendance.location = location || undefined;
    attendance.radius = location ? getQrConfig().radius : undefined;
};

// điểm danh thủ công: giữ nguyên thông tin check-in (QR) của những sinh viên không bị đổi trạng thái
const mergeManualRecords = (existingRecords, incomingRecords) => {
    const byStudent = new Map(existingRecords.map(r => [String(r.studentId), r]));
    return incomingRecords.map(r => {
        const old = byStudent.get(String(r.studentId));
        if (old && old.status === r.status) return old.toObject();
        return { studentId: r.studentId, status: r.status, method: r.status ? 'manual' : undefined };
    });
};

module.exports = {
    getQrConfig, dateKeyInVN, todayInVN, toDateKey, parseLocation, hasLocation, distanceInMeters,
    activeQrFilter, isQrActive, formatQrSession, parseQrMinutes, applyQrSession, mergeManualRecords
};
