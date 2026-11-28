const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const Classes = require('../models/Classes');
const Attendances = require('../models/Attendances');
const Projects = require('../models/Project');
const ExamClasses = require('../models/ExamClasses');
const { removeFacePhoto } = require('../utils/face');

const DEFAULT_PASSWORD = '123456';

// khác biệt giữa quản lý sinh viên và giảng viên (giữ nguyên key trong response cho frontend)
const ROLES = {
    student: {
        listKey: 'students',
        detailKey: 'student',
        label: 'sinh viên',
        codeLabel: 'MSSV',
        editableFields: ['name', 'code', 'email', 'dob', 'gender', 'ethnic', 'school', 'branch', 'className', 'trainingSystem', 'hometown', 'identificationNumber', 'phone']
    },
    teacher: {
        listKey: 'teachers',
        detailKey: 'teacher',
        label: 'giảng viên',
        codeLabel: 'Mã giảng viên',
        editableFields: ['name', 'code', 'email', 'dob', 'gender', 'ethnic', 'school', 'branch', 'trainingSystem', 'hometown', 'identificationNumber', 'phone']
    }
};

// khóa học của sinh viên tính từ MSSV, vd 20215xxx -> 21 + 45 = 66
const schoolYearFromCode = (code) => {
    const year = parseInt(String(code).substring(2, 4), 10);
    return isNaN(year) ? null : year + 45;
};

const getAllUsers = (role) => async (req, res) => {
    const { listKey } = ROLES[role];
    try {
        let { page = 1, limit = 8, search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const query = { role };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('name code email')
            .sort({ code: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            [listKey]: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getUserDetail = (role) => async (req, res) => {
    const { detailKey, label } = ROLES[role];
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: id, role }).select('-password +faceData');
        if (!user) {
            return res.status(404).json({ message: `Không tìm thấy ${label}` });
        }
        // chỉ trả trạng thái đăng ký khuôn mặt, không trả embedding/đường dẫn ảnh
        const { faceData, ...detail } = user.toObject();
        res.status(200).json({
            [detailKey]: {
                ...detail,
                faceRegistered: !!faceData?.embedding?.length,
                faceRegisteredAt: faceData?.registeredAt || null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const createUser = (role) => async (req, res) => {
    const { detailKey, label, codeLabel } = ROLES[role];
    try {
        const { name, code, email, dob, gender } = req.body;
        // check bắt buộc
        if (!name || !code || !email) {
            return res.status(400).json({ message: 'Thiếu thông tin tên/code/email' });
        }

        const existed = await User.findOne({ $or: [{ code }, { email }] });
        if (existed) {
            return res.status(400).json({ message: `${codeLabel} hoặc email đã tồn tại` });
        }

        // tạo mật khẩu mặc định
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        const user = await User.create({
            name, code, email, password: hashedPassword, role, dob, gender,
            schoolYear: role === 'student' ? schoolYearFromCode(code) : undefined
        });

        res.status(201).json({
            message: `Thêm ${label} thành công`,
            [detailKey]: {
                id: user._id,
                name: user.name,
                code: user.code,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: `${codeLabel} hoặc email đã tồn tại` });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateUser = (role) => async (req, res) => {
    const { detailKey, label, codeLabel, editableFields } = ROLES[role];
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: id, role });
        if (!user) {
            return res.status(404).json({ message: `Không tìm thấy ${label}` });
        }
        editableFields.forEach(field => {
            if (req.body[field] !== undefined) user[field] = req.body[field];
        });
        if (role === 'student' && req.body.code !== undefined) {
            user.schoolYear = schoolYearFromCode(req.body.code);
        }
        await user.save();
        res.status(200).json({
            message: 'Cập nhật thông tin thành công',
            [detailKey]: {
                _id: user._id,
                name: user.name,
                code: user.code,
                email: user.email,
                dob: user.dob,
                gender: user.gender,
                ethnic: user.ethnic,
                school: user.school,
                branch: user.branch,
                className: user.className,
                trainingSystem: user.trainingSystem,
                hometown: user.hometown,
                identificationNumber: user.identificationNumber,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error(error);
        // trùng mã/email
        if (error.code === 11000) {
            return res.status(400).json({ message: `${codeLabel} hoặc email đã tồn tại` });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// danh sách rút gọn để chọn trong modal (thêm sinh viên vào lớp, chọn giảng viên...)
const getUsersForModal = (role) => async (req, res) => {
    const { listKey } = ROLES[role];
    try {
        const { search = '' } = req.query;

        const query = { role };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('_id name code email')
            .sort({ code: 1 });

        res.status(200).json({ [listKey]: users });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(DEFAULT_PASSWORD, salt);
        await user.save();
        res.status(200).json({ message: 'Đã reset mật khẩu về mặc định.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// chỉ được xóa người dùng chưa có dữ liệu phát sinh; checks = [[truy vấn exists, thông báo]], trả về thông báo đầu tiên bị vướng
const findDeleteBlocker = async (checks) => {
    const results = await Promise.all(checks.map(([query]) => query));
    const index = results.findIndex(Boolean);
    return index === -1 ? null : checks[index][1];
};

// xóa sinh viên: chặn nếu sinh viên đang thuộc lớp học, lớp thi, đồ án hoặc đã có dữ liệu điểm danh
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await User.findOne({ _id: id, role: 'student' }, '+faceData');
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }

        const blocker = await findDeleteBlocker([
            [Classes.exists({ students: id }), 'Sinh viên đang thuộc lớp học, không thể xóa'],
            [ExamClasses.exists({ 'rooms.students': id }), 'Sinh viên đang thuộc lớp thi, không thể xóa'],
            [Attendances.exists({ 'records.studentId': id }), 'Sinh viên đã có dữ liệu điểm danh, không thể xóa'],
            [Projects.exists({ 'members.studentId': id }), 'Sinh viên đang thuộc đồ án, không thể xóa']
        ]);
        if (blocker) {
            return res.status(409).json({ message: blocker });
        }

        await student.deleteOne();
        await removeFacePhoto(student.faceData?.photoPath).catch(err => console.error('Lỗi khi xóa ảnh khuôn mặt:', err));
        res.status(200).json({ message: 'Đã xóa sinh viên' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// xóa giảng viên: chặn nếu giảng viên đang phụ trách lớp học, đồ án, coi thi hoặc đã điểm danh
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await User.findOne({ _id: id, role: 'teacher' });
        if (!teacher) {
            return res.status(404).json({ message: 'Không tìm thấy giảng viên' });
        }

        const blocker = await findDeleteBlocker([
            [Classes.exists({ teacherId: id }), 'Giảng viên đang phụ trách lớp học, không thể xóa'],
            [ExamClasses.exists({ 'rooms.invigilators': id }), 'Giảng viên đang được phân công coi thi, không thể xóa'],
            [Attendances.exists({ teacherId: id }), 'Giảng viên đã có dữ liệu điểm danh, không thể xóa'],
            [Projects.exists({ teacherId: id }), 'Giảng viên đang phụ trách đồ án, không thể xóa']
        ]);
        if (blocker) {
            return res.status(409).json({ message: blocker });
        }

        await teacher.deleteOne();
        res.status(200).json({ message: 'Đã xóa giảng viên' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getAllUsers, getUserDetail, createUser, updateUser, getUsersForModal,
    resetPassword, deleteStudent, deleteTeacher
};
