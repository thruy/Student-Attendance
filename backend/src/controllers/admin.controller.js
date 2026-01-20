const User = require('../models/Users');
const Class = require('../models/Classes');
const Attendance = require('../models/Attendances');

const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name code email createdAt')
            .sort({ createdAt: -1 });

        res.json({
            total: students.length,
            students
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
}

module.exports = { getAllStudents }