const mongoose = require('mongoose');
const Classes = require('../models/Classes');

// thông tin lớp gửi về frontend, cls cần populate teacherId và students
const formatClassDetail = (cls) => ({
    classId: cls._id,
    subjectCode: cls.subjectCode,
    name: cls.name,
    classCode: cls.classCode,
    type: cls.type,
    semester: cls.semester,
    teacher: {
        id: cls.teacherId?._id,
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
});

const idOf = (ref) => String(ref?._id ?? ref);

// admin: mọi lớp; giảng viên: lớp mình phụ trách; sinh viên: lớp mình học
const canAccessClass = (cls, user) => {
    if (user.role === 'admin') return true;
    if (user.role === 'teacher') return idOf(cls.teacherId) === String(user.userId);
    return cls.students.some(s => idOf(s) === String(user.userId));
};

// tìm lớp và kiểm tra quyền truy cập; populate = true để lấy kèm thông tin giảng viên/sinh viên
const findAccessibleClass = async (classId, user, { populate = false } = {}) => {
    if (!mongoose.isValidObjectId(classId)) return { status: 404, message: 'Không tìm thấy lớp học' };
    let query = Classes.findById(classId);
    if (populate) {
        query = query.populate('teacherId', 'name email code').populate('students', 'name email code');
    }
    const cls = await query;
    if (!cls) return { status: 404, message: 'Không tìm thấy lớp học' };
    if (!canAccessClass(cls, user)) return { status: 403, message: 'Bạn không có quyền truy cập lớp học này' };
    return { cls };
};

module.exports = { formatClassDetail, findAccessibleClass };
