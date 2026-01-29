const User = require('../models/Users');
const Class = require('../models/Classes');
const Attendance = require('../models/Attendances');
const bcrypt = require('bcryptjs');
const DEFAULT_PASSWORD = '123456';
// students
const getAllStudents = async (req, res) => {
    try {
        let { page = 1, limit = 8, search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const query = { role: 'student' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const students = await User.find(query)
            .select('name code email')
            .sort({ code: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            students,
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
}

const getStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await User.findOne({ _id: id, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }
        res.status(201).json({ student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const createStudent = async (req, res) => {
    try {
        const { name, code, email, dob, gender, } = req.body;
        // check bắt buộc
        if (!name || !code || !email) {
            return res.status(400).json({ message: 'Thiếu thông tin tên/code/email' });
        }

        const existed = await User.findOne({ $or: [{ code }, { email }] });
        if (existed) {
            return res.status(400).json({ message: 'MSSV hoặc email đã tồn tại' });
        }

        // tạo mật khẩu mặc định
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        // tính khóa học
        let schoolYear = null;
        const year = parseInt(code.substring(2, 4), 10);
        if (!isNaN(year)) {
            schoolYear = year + 45;
        }

        const student = await User.create({
            name, code, email, password: hashedPassword, role: 'student', dob, gender, schoolYear
        });

        res.status(201).json({
            message: 'Thêm sinh viên thành công',
            student: {
                id: student._id,
                name: student.name,
                code: student.code,
                email: student.email
            }
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'MSSV hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, email, dob, gender, ethnic, school, branch, className, trainingSystem, hometown, identificationNumber, phone } = req.body;
        const student = await User.findOne({ _id: id, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }
        if (name !== undefined) student.name = name;
        if (code !== undefined) student.code = code;
        if (email !== undefined) student.email = email;
        if (dob !== undefined) student.dob = dob;
        if (gender !== undefined) student.gender = gender;
        if (ethnic !== undefined) student.ethnic = ethnic;
        if (school !== undefined) student.school = school;
        if (branch !== undefined) student.branch = branch;
        if (className !== undefined) student.className = className;
        if (trainingSystem !== undefined) student.trainingSystem = trainingSystem;
        if (hometown !== undefined) student.hometown = hometown;
        if (identificationNumber !== undefined) student.identificationNumber = identificationNumber;
        if (phone !== undefined) student.phone = phone;
        const year = parseInt(code.substring(2, 4), 10);
        student.schoolYear = year + 45;
        await student.save();
        res.status(200).json({
            message: 'Cập nhật thông tin thành công',
            student: {
                _id: student._id,
                name: student.name,
                code: student.code,
                email: student.email,
                dob: student.dob,
                gender: student.gender,
                ethnic: student.ethnic,
                school: student.school,
                branch: student.branch,
                className: student.className,
                trainingSystem: student.trainingSystem,
                hometown: student.hometown,
                identificationNumber: student.identificationNumber,
                phone: student.phone
            }
        });

    } catch (error) {
        console.error(error);
        // trùng MSSV/email
        if (error.code === 11000) {
            return res.status(400).json({ message: 'MSSV hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
}

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

//teacher
const getAllTeachers = async (req, res) => {
    try {
        let { page = 1, limit = 8, search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const query = { role: 'teacher' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const teachers = await User.find(query)
            .select('name code email')
            .sort({ code: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            teachers,
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
}

const getTeacherDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await User.findOne({ _id: id, role: 'teacher' });
        if (!teacher) {
            return res.status(404).json({ message: 'Không tìm thấy giảng viên' });
        }
        res.status(201).json({ teacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

const createTeacher = async (req, res) => {
    try {
        const { name, code, email, dob, gender, } = req.body;
        // check bắt buộc
        if (!name || !code || !email) {
            return res.status(400).json({ message: 'Thiếu thông tin tên/code/email' });
        }

        const existed = await User.findOne({ $or: [{ code }, { email }] });
        if (existed) {
            return res.status(400).json({ message: 'Mã giảng viên hoặc email đã tồn tại' });
        }

        // tạo mật khẩu mặc định
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        // tính khóa học
        let schoolYear = null;
        const year = parseInt(code.substring(2, 4), 10);
        if (!isNaN(year)) {
            schoolYear = year + 45;
        }

        const teacher = await User.create({
            name, code, email, password: hashedPassword, role: 'teacher', dob, gender, schoolYear
        });

        res.status(201).json({
            message: 'Thêm sinh viên thành công',
            teacher: {
                id: teacher._id,
                name: teacher.name,
                code: teacher.code,
                email: teacher.email
            }
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mã giảng viên hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, email, dob, gender, ethnic, school, branch, trainingSystem, hometown, identificationNumber, phone } = req.body;
        const teacher = await User.findOne({ _id: id, role: 'teacher' });
        if (!teacher) {
            return res.status(404).json({ message: 'Không tìm thấy giảng viên' });
        }
        if (name !== undefined) teacher.name = name;
        if (code !== undefined) teacher.code = code;
        if (email !== undefined) teacher.email = email;
        if (dob !== undefined) teacher.dob = dob;
        if (gender !== undefined) teacher.gender = gender;
        if (ethnic !== undefined) teacher.ethnic = ethnic;
        if (school !== undefined) teacher.school = school;
        if (branch !== undefined) teacher.branch = branch;
        if (trainingSystem !== undefined) teacher.trainingSystem = trainingSystem;
        if (hometown !== undefined) teacher.hometown = hometown;
        if (identificationNumber !== undefined) teacher.identificationNumber = identificationNumber;
        if (phone !== undefined) teacher.phone = phone;
        const year = parseInt(code.substring(2, 4), 10);
        teacher.schoolYear = year + 45;
        await teacher.save();
        res.status(200).json({
            message: 'Cập nhật thông tin thành công',
            teacher: {
                _id: teacher._id,
                name: teacher.name,
                code: teacher.code,
                email: teacher.email,
                dob: teacher.dob,
                gender: teacher.gender,
                ethnic: teacher.ethnic,
                school: teacher.school,
                branch: teacher.branch,
                className: teacher.className,
                trainingSystem: teacher.trainingSystem,
                hometown: teacher.hometown,
                identificationNumber: teacher.identificationNumber,
                phone: teacher.phone
            }
        });

    } catch (error) {
        console.error(error);
        // trùng MSSV/email
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mã giảng viên hoặc email đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
}

module.exports = {
    resetPassword,
    getAllStudents, getStudentDetails, createStudent, updateStudent,
    getAllTeachers, getTeacherDetails, createTeacher, updateTeacher,
}