const { body, param, validationResult } = require('express-validator');
const SIS_EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+\d{6}@sis\.hust\.edu\.vn$/;

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("VALIDATION ERRORS:", errors.array());
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

const registerValidate = [
    body('name')
        .trim()
        .notEmpty().withMessage('Họ và tên không được để trống')
        .isLength({ min: 2, max: 30 }).withMessage('Họ và tên có chứa 2 - 30 kí tự')
        .isAlpha('vi-VN', { ignore: ' ' }).withMessage('Họ và tên chỉ được chứa chữ cái'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .matches(SIS_EMAIL_REGEX).withMessage('Email không đúng định dạng')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu cần có ít nhất 6 kí tự'),
    body('gender')
        .notEmpty().withMessage('Giới tính không được để trống')
        .isIn(['Nam', 'Nữ', 'Khác']).withMessage('Giới tính không hợp lệ'),
    body('dob')
        .notEmpty().withMessage('Ngày sinh không được để trống')
        .isDate().withMessage('Ngày sinh không hợp lệ'),
    validate
];

const loginValidate = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .matches(SIS_EMAIL_REGEX).withMessage('Email không đúng định dạng'),
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống'),
    validate
];

module.exports = { validate, loginValidate, registerValidate }