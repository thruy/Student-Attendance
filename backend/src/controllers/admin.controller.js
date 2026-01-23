const User = require('../models/Users');
const Class = require('../models/Classes');
const Attendance = require('../models/Attendances');
const bcrypt = require('bcryptjs');
const DEFAULT_PASSWORD = '123456';

const getAllStudents = async (req, res) => {
    try {
        let { page = 1, limit = 6, search = '' } = req.query;
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
        res.json({ student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

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
        const user = await User.findOne({ _id: id, role: 'student' });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(DEFAULT_PASSWORD, salt);
        await student.save();
        res.status(200).json({ message: 'Đã reset mật khẩu về mặc định.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


module.exports = { getAllStudents, getStudentDetails, updateStudent, resetPassword }