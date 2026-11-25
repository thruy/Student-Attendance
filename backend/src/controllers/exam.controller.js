const User = require('../models/Users');
const ExamClasses = require('../models/ExamClasses');
const { formatClassDetail, findAccessibleClass } = require('../utils/class');
const { isExamAttendanceLocked } = require('../utils/exam');

const LOCKED_MESSAGE = 'Lớp thi đã được điểm danh, không thể chia lại hoặc xóa';

// kết quả chia lớp thi gửi về frontend, sinh viên và cán bộ coi thi chỉ gửi id
const formatExam = (exam) => exam && ({
    maxPerRoom: exam.maxPerRoom,
    updatedAt: exam.updatedAt,
    rooms: exam.rooms.map(r => ({
        examCode: r.examCode,
        room: r.room,
        startTime: r.startTime,
        endTime: r.endTime,
        invigilators: r.invigilators.map(String),
        students: r.students.map(String)
    }))
});

// thông tin lớp + kết quả chia lớp thi đã lưu + danh sách giảng viên để chọn cán bộ coi thi (admin, giảng viên)
const getClassExam = async (req, res) => {
    try {
        const { classId } = req.params;
        const { cls, status, message } = await findAccessibleClass(classId, req.user, { populate: true });
        if (!cls) { return res.status(status).json({ message }); }

        const [exam, teachers, attendanceLocked] = await Promise.all([
            ExamClasses.findOne({ classId }),
            User.find({ role: 'teacher' }).select('_id name code email').sort({ code: 1 }),
            isExamAttendanceLocked(classId)
        ]);
        res.status(200).json({
            class: formatClassDetail(cls),
            exam: formatExam(exam),
            teachers,
            attendanceLocked
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin lớp thi', error: err.message });
    }
};

// lưu (ghi đè) toàn bộ danh sách lớp thi của một lớp học
const saveClassExam = async (req, res) => {
    try {
        const { classId } = req.params;
        const { cls, status, message } = await findAccessibleClass(classId, req.user);
        if (!cls) { return res.status(status).json({ message }); }
        if (await isExamAttendanceLocked(classId)) { return res.status(409).json({ message: LOCKED_MESSAGE }); }

        const { maxPerRoom, rooms } = req.body;

        // mỗi sinh viên phải thuộc lớp học và chỉ nằm trong một lớp thi
        const classStudentIds = new Set(cls.students.map(String));
        const assigned = new Set();
        for (const r of rooms) {
            for (const studentId of r.students) {
                if (!classStudentIds.has(studentId)) {
                    return res.status(400).json({ message: `Lớp thi ${r.examCode} có sinh viên không thuộc lớp học` });
                }
                if (assigned.has(studentId)) {
                    return res.status(400).json({ message: 'Có sinh viên được xếp vào nhiều lớp thi' });
                }
                assigned.add(studentId);
            }
        }

        // cán bộ coi thi phải là giảng viên
        const invigilatorIds = [...new Set(rooms.flatMap(r => r.invigilators))];
        const teacherCount = await User.countDocuments({ _id: { $in: invigilatorIds }, role: 'teacher' });
        if (teacherCount !== invigilatorIds.length) {
            return res.status(400).json({ message: 'Cán bộ coi thi phải là giảng viên trong hệ thống' });
        }

        const exam = await ExamClasses.findOneAndUpdate(
            { classId },
            {
                classId,
                maxPerRoom,
                updatedBy: req.user.userId,
                rooms: rooms.map(r => ({
                    examCode: r.examCode,
                    room: r.room,
                    startTime: r.startTime,
                    endTime: r.endTime,
                    invigilators: [...new Set(r.invigilators)],
                    students: r.students
                }))
            },
            { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Lưu danh sách lớp thi thành công', exam: formatExam(exam) });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lưu danh sách lớp thi', error: err.message });
    }
};

const deleteClassExam = async (req, res) => {
    try {
        const { classId } = req.params;
        const { cls, status, message } = await findAccessibleClass(classId, req.user);
        if (!cls) { return res.status(status).json({ message }); }
        if (await isExamAttendanceLocked(classId)) { return res.status(409).json({ message: LOCKED_MESSAGE }); }

        const result = await ExamClasses.deleteOne({ classId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Lớp học chưa được chia lớp thi' });
        }
        res.status(200).json({ message: 'Đã xóa danh sách lớp thi' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa danh sách lớp thi', error: err.message });
    }
};

// lịch thi của sinh viên đang đăng nhập
const getMyExams = async (req, res) => {
    try {
        const { userId } = req.user;
        const exams = await ExamClasses.find({ 'rooms.students': userId })
            .populate('classId', 'name subjectCode classCode semester')
            .populate('rooms.invigilators', 'name email');

        const result = exams
            .map(exam => {
                const room = exam.rooms.find(r => r.students.some(id => String(id) === String(userId)));
                return {
                    classId: exam.classId?._id,
                    name: exam.classId?.name,
                    subjectCode: exam.classId?.subjectCode,
                    classCode: exam.classId?.classCode,
                    semester: exam.classId?.semester,
                    examCode: room.examCode,
                    room: room.room,
                    startTime: room.startTime,
                    endTime: room.endTime,
                    numberOfStudents: room.students.length,
                    invigilators: room.invigilators.map(t => ({ name: t.name, email: t.email }))
                };
            })
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        res.status(200).json({ exams: result });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy lịch thi', error: err.message });
    }
};

// các lớp thi mà giảng viên đang đăng nhập được phân công coi thi
const getMyInvigilations = async (req, res) => {
    try {
        const { userId } = req.user;
        const exams = await ExamClasses.find({ 'rooms.invigilators': userId })
            .populate('classId', 'name subjectCode classCode semester');

        const result = exams
            .flatMap(exam => exam.rooms
                .filter(r => r.invigilators.some(id => String(id) === String(userId)))
                .map(room => ({
                    classId: exam.classId?._id,
                    name: exam.classId?.name,
                    subjectCode: exam.classId?.subjectCode,
                    classCode: exam.classId?.classCode,
                    semester: exam.classId?.semester,
                    examCode: room.examCode,
                    room: room.room,
                    startTime: room.startTime,
                    endTime: room.endTime,
                    numberOfStudents: room.students.length
                })))
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        res.status(200).json({ exams: result });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy lịch coi thi', error: err.message });
    }
};

module.exports = { getClassExam, saveClassExam, deleteClassExam, getMyExams, getMyInvigilations };
