const User = require('../models/Users');
const Classes = require('../models/Classes');
const Attendances = require('../models/Attendances');
const { formatClassDetail, findAccessibleClass } = require('../utils/class');

// thời khóa biểu của người đang đăng nhập (sinh viên hoặc giảng viên)
const getMyTimetable = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const filter = role === 'teacher' ? { teacherId: userId } : { students: userId };
        const classes = await Classes.find(filter).populate('teacherId', 'name email');

        const timetable = classes.map(cls => ({
            classId: cls._id,
            subjectCode: cls.subjectCode,
            name: cls.name,
            classCode: cls.classCode,
            type: cls.type,
            semester: cls.semester,
            numberOfStudents: cls.students.length,
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

// thông tin chi tiết một lớp kèm danh sách sinh viên
const getClassInfo = async (req, res) => {
    try {
        const { cls, status, message } = await findAccessibleClass(req.params.id, req.user, { populate: true });
        if (!cls) { return res.status(status).json({ message }); }
        res.status(200).json({ classInfo: formatClassDetail(cls) });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sinh viên', error: error.message });
    }
};

const getAllClasses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const semester = req.query.semester;
        const filter = {};
        if (semester) {
            filter.semester = semester;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { classCode: { $regex: search, $options: 'i' } },
                { subjectCode: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Classes.countDocuments(filter);

        const classes = await Classes.find(filter)
            .select('name subjectCode classCode type schedule teacherId')
            .populate({
                path: 'teacherId',
                select: 'name email'
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            classes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const createClass = async (req, res) => {
    try {
        const { subjectCode, name, classCode, type, semester, teacherId, date, schedule, students = [] } = req.body;
        if (!subjectCode || !name || !classCode || !type || !semester || !teacherId || !date || !schedule) {
            return res.status(400).json({ message: 'Thiếu thông tin lớp học' });
        }

        const existed = await Classes.findOne({ classCode });
        if (existed) {
            return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
        }

        const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
        if (!teacher) {
            return res.status(400).json({ message: 'Giảng viên không hợp lệ' });
        }
        const parsedDates = date.map(d => new Date(d));

        const newClass = await Classes.create({ subjectCode, name, classCode, type, semester, teacherId, students, date: parsedDates, schedule });
        res.status(201).json({
            message: 'Tạo lớp học thành công',
            class: {
                id: newClass._id,
                classCode: newClass.classCode,
                name: newClass.name,
                semester: newClass.semester
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const updates = req.body;

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        if (updates.teacherId) {
            const teacher = await User.findOne({ _id: updates.teacherId, role: 'teacher' });
            if (!teacher) {
                return res.status(400).json({ message: 'Giảng viên không hợp lệ' });
            }
        }
        Object.keys(updates).forEach(key => {
            cls[key] = updates[key];
        });

        await cls.save();
        res.status(200).json({
            message: 'Cập nhật lớp học thành công',
            class: cls
        });
    } catch (err) {
        console.error(err);

        if (err.code === 11000) {
            return res.status(400).json({ message: 'Mã lớp đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        await Attendances.deleteMany({ classId });
        await cls.deleteOne();

        res.status(200).json({
            message: 'Đã xóa lớp học và toàn bộ phiên điểm danh liên quan'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const addStudentsToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentIds } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'Danh sách sinh viên không hợp lệ/không có sinh viên nào' });
        }

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        const students = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('_id');
        if (students.length === 0) {
            return res.status(400).json({ message: 'Không có sinh viên hợp lệ' });
        }

        const newStudentIds = students
            .map(s => s._id.toString())
            .filter(id => !cls.students.map(x => x.toString()).includes(id));

        cls.students.push(...newStudentIds);
        await cls.save();

        res.status(200).json({
            message: 'Thêm sinh viên vào lớp thành công',
            addedCount: newStudentIds.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const removeStudentFromClass = async (req, res) => {
    try {
        const { classId, studentId } = req.params;

        const cls = await Classes.findById(classId);
        if (!cls) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học' });
        }

        const before = cls.students.length;
        cls.students = cls.students.filter(id => id.toString() !== studentId);
        if (cls.students.length === before) {
            return res.status(400).json({ message: 'Sinh viên không thuộc lớp này' });
        }

        await cls.save();
        res.status(200).json({ message: 'Đã xóa sinh viên khỏi lớp' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getMyTimetable, getClassInfo,
    getAllClasses, createClass, updateClass, deleteClass,
    addStudentsToClass, removeStudentFromClass
};
