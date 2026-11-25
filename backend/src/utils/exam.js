const mongoose = require('mongoose');
const Classes = require('../models/Classes');
const ExamClasses = require('../models/ExamClasses');
const Attendances = require('../models/Attendances');
const { dateKeyInVN, todayInVN } = require('./attendance');

// ngày thi của lớp thi (startTime và endTime luôn cùng một ngày), dạng YYYY-MM-DD theo giờ VN
const examDateKey = (room) => dateKeyInVN(room.startTime);

// đã có phiên điểm danh thi nào thì không được chia lại / xóa danh sách lớp thi
const isExamAttendanceLocked = async (classId) => !!(await Attendances.exists({ classId, examCode: { $ne: null } }));

// tìm lớp thi và kiểm tra quyền: admin, cán bộ coi thi của lớp thi được điểm danh; giảng viên của lớp chỉ được xem
// permissions: QR và khuôn mặt chỉ trong ngày thi; thủ công thì cán bộ coi thi chỉ trong ngày thi, admin bất kỳ lúc nào
const findAccessibleExamRoom = async (classId, examCode, user) => {
    if (!mongoose.isValidObjectId(classId)) return { status: 404, message: 'Không tìm thấy lớp học' };
    const [cls, exam] = await Promise.all([Classes.findById(classId), ExamClasses.findOne({ classId })]);
    if (!cls) return { status: 404, message: 'Không tìm thấy lớp học' };

    const room = exam?.rooms.find(r => r.examCode === examCode);
    if (!room) return { status: 404, message: 'Không tìm thấy lớp thi' };

    const isAdmin = user.role === 'admin';
    const isInvigilator = user.role === 'teacher' && room.invigilators.some(id => String(id) === String(user.userId));
    const isClassTeacher = user.role === 'teacher' && String(cls.teacherId) === String(user.userId);
    if (!isAdmin && !isInvigilator && !isClassTeacher) {
        return { status: 403, message: 'Bạn không có quyền truy cập lớp thi này' };
    }

    const canEdit = isAdmin || isInvigilator;
    const isExamDay = todayInVN() === examDateKey(room);
    const permissions = {
        edit: canEdit,
        manual: canEdit && (isAdmin || isExamDay),
        qr: canEdit && isExamDay,
        face: canEdit && isExamDay
    };
    return { cls, exam, room, canEdit, permissions };
};

module.exports = { examDateKey, isExamAttendanceLocked, findAccessibleExamRoom };
