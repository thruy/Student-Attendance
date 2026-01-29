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

const editUserValidate = [
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
    body('code')
        .notEmpty().withMessage('MSSV không được để trống')
        .matches(/^\d{8}$/).withMessage('MSSV gồm 8 chữ số'),
    body('gender')
        .notEmpty().withMessage('Giới tính không được để trống')
        .isIn(['Nam', 'Nữ', 'Khác']).withMessage('Giới tính không hợp lệ'),
    body('dob')
        .notEmpty().withMessage('Ngày sinh không được để trống')
        .isDate().withMessage('Ngày sinh không hợp lệ')
        .custom(value => {
            if (new Date(value) > new Date()) { throw new Error('Ngày sinh không được lớn hơn ngày hiện tại'); }
            return true;
        }),
    body('ethnic')
        .optional()
        .matches(/^[a-zA-Z\s]+$/).withMessage('Dân tộc chỉ được chứa chữ cái'),
    body('trainingSystem')
        .optional()
        .isIn(['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ']).withMessage('Hệ đào tạo không hợp lệ'),
    body('hometown')
        .optional()
        .isLength({ min: 1, max: 200 }).withMessage('Quê quán có độ dài từ 1 đến 200 ký tự'),
    body('identificationNumber')
        .optional()
        .matches(/^\d{12}$/).withMessage('Số CMND/CCCD chứa 12 chữ số'),
    body('phone')
        .optional()
        .matches(/^\d{10}$/).withMessage('Số điện thoại chỉ được chứa 10 chữ số'),
    validate
];

const addUserValidate = [
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
    body('code')
        .notEmpty().withMessage('MSSV/MSGV không được để trống')
        .matches(/^\d{8}$/).withMessage('MSSV/MSGV gồm 8 chữ số'),
    body('gender')
        .notEmpty().withMessage('Giới tính không được để trống')
        .isIn(['Nam', 'Nữ', 'Khác']).withMessage('Giới tính không hợp lệ'),
    body('dob')
        .notEmpty().withMessage('Ngày sinh không được để trống')
        .isDate().withMessage('Ngày sinh không hợp lệ'),
    validate
];

module.exports = { validate, editUserValidate, addUserValidate }