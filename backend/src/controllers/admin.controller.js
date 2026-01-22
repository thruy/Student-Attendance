const User = require('../models/Users');
const Class = require('../models/Classes');
const Attendance = require('../models/Attendances');

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

module.exports = { getAllStudents, getStudentDetails }