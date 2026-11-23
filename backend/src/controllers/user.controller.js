const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const Classes = require('../models/Classes');
const Attendances = require('../models/Attendances');
const Projects = require('../models/Project');
const ExamClasses = require('../models/ExamClasses');

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
        const user = await User.findOne({ _id: id, role });
        if (!user) {
            return res.status(404).json({ message: `Không tìm thấy ${label}` });
        }
        res.status(200).json({ [detailKey]: user });
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

// xóa sinh viên: gỡ khỏi lớp học, phiên điểm danh và đồ án
const deleteStudent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const student = await User.findOne({ _id: id, role: 'student' }, null, { session });
        if (!student) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }

        await Classes.updateMany({ students: id }, { $pull: { students: id } }, { session });
        await Attendances.updateMany(
            { 'records.studentId': id },
            { $pull: { records: { studentId: id } } },
            { session }
        );
        await Projects.updateMany(
            { 'members.studentId': id },
            { $pull: { members: { studentId: id } } },
            { session }
        );
        await ExamClasses.updateMany(
            { 'rooms.students': id },
            { $pull: { 'rooms.$[].students': id } },
            { session }
        );

        await student.deleteOne({ session });
        await session.commitTransaction();
        res.status(200).json({ message: 'Đã xóa sinh viên và gỡ khỏi lớp học, đồ án, điểm danh, lớp thi' });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    } finally {
        session.endSession();
    }
};

// xóa giảng viên: xóa luôn đồ án, lớp học, phiên điểm danh và lớp thi của các lớp đó, gỡ khỏi danh sách coi thi
const deleteTeacher = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const teacher = await User.findOne({ _id: id, role: 'teacher' }, null, { session });
        if (!teacher) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Không tìm thấy giảng viên' });
        }

        const projectResult = await Projects.deleteMany({ teacherId: id }, { session });

        const classes = await Classes.find({ teacherId: id }, '_id', { session });
        const classIds = classes.map(c => c._id);
        if (classIds.length > 0) {
            await Attendances.deleteMany({ classId: { $in: classIds } }, { session });
            await ExamClasses.deleteMany({ classId: { $in: classIds } }, { session });
        }
        await ExamClasses.updateMany(
            { 'rooms.invigilators': id },
            { $pull: { 'rooms.$[].invigilators': id } },
            { session }
        );

        const classResult = await Classes.deleteMany({ teacherId: id }, { session });
        await teacher.deleteOne({ session });
        await session.commitTransaction();

        res.status(200).json({
            message: 'Đã xóa giảng viên và dữ liệu liên quan',
            deleted: {
                projects: projectResult.deletedCount,
                classes: classResult.deletedCount
            }
        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    } finally {
        session.endSession();
    }
};

module.exports = {
    getAllUsers, getUserDetail, createUser, updateUser, getUsersForModal,
    resetPassword, deleteStudent, deleteTeacher
};
