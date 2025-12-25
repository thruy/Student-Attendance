const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const register = async (req, res) => {
    try {
        const { name, email, password, code, role } = req.body;
        const existingEmailUser = await User.findOne({ email });
        const existingCodeUser = await User.findOne({ code });
        if (existingEmailUser || existingCodeUser) {
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email, password: hashedPassword, code, role });
        res.status(201).json({ message: 'Đăng kí người dùng thành công', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng, vui lòng thử lại' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng, vui lòng thử lại' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
        res.cookie('access_token', token, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 7 * 24 * 3600 * 1000 });
        res.json({ message: 'Đăng nhập thành công', token });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
}

const verify = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('name code email role');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ message: 'Đã xác thực', user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server!', error: error.message });
    }
}

const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === "production" });
    return res.status(200).json({ message: "Đăng xuất thành công" });
}

module.exports = { register, login, verify, logout };