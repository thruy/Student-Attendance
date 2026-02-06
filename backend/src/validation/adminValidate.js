const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const SIS_EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+\d{6}@sis\.hust\.edu\.vn$/;
const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

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

const createClassValidate = [
    body('subjectCode')
        .trim()
        .notEmpty().withMessage('Mã học phần không được để trống')
        .matches(/^[A-Za-z]{2}\d{4}/).withMessage('Mã học phần không đúng định dạng'),
    body('classCode')
        .trim()
        .matches(/^\d{6}$/).withMessage('Mã lớp không đúng định dạng'),
    body('name')
        .trim()
        .isLength({ min: 3 }).withMessage('Tên lớp phải có ít nhất 3 ký tự'),
    body('type')
        .notEmpty().withMessage('Loại lớp không được để trống')
        .isIn(['Lý thuyết', 'Bài tập', 'Thực hành']).withMessage('Loại lớp không hợp lệ'),
    body('semester')
        .matches(/^\d{5}$/).withMessage('Học kỳ không hợp lệ'),
    body('teacherId')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Giảng viên không hợp lệ'),
    body('date')
        .isArray({ min: 1 }).withMessage('Danh sách ngày học phải là mảng'),
    body('date.*')
        .isISO8601().withMessage('Ngày học không hợp lệ'),

    body('schedule')
        .isArray({ min: 1 }).withMessage('Lịch học phải là mảng'),
    body('schedule.*.dayOfWeek')
        .isIn(DAYS).withMessage('Thứ trong tuần không hợp lệ'),
    body('schedule.*.startTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ bắt đầu không hợp lệ'),
    body('schedule.*.endTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ kết thúc không hợp lệ'),
    body('schedule.*.room')
        .trim()
        .notEmpty().withMessage('Phòng học không được để trống'),
    validate
];

const updateClassValidate = [
    body('subjectCode')
        .optional()
        .matches(/^[A-Za-z]{2}\d{4}.*/).withMessage('Mã môn không hợp lệ'),
    body('classCode')
        .optional()
        .matches(/^\d{6}$/).withMessage('Mã lớp gồm 6 chữ số'),
    body('name')
        .optional()
        .isLength({ min: 3 }).withMessage('Tên lớp tối thiểu 3 ký tự'),
    body('type')
        .optional()
        .isIn(['Lý thuyết', 'Bài tập', 'Thực hành']).withMessage('Loại lớp không hợp lệ'),
    body('semester')
        .optional()
        .matches(/^\d{5}$/).withMessage('Học kỳ không hợp lệ'),
    body('teacherId')
        .optional()
        .isMongoId().withMessage('teacherId không hợp lệ'),
    body('date')
        .optional()
        .isArray({ min: 1 }).withMessage('date phải là mảng'),
    body('date.*')
        .optional()
        .isISO8601().withMessage('Ngày học không hợp lệ'),

    body('schedule')
        .optional()
        .isArray({ min: 1 }).withMessage('schedule phải là mảng'),
    body('schedule.*.dayOfWeek')
        .optional()
        .isIn(DAYS).withMessage('Ngày học không hợp lệ'),
    body('schedule.*.startTime')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ bắt đầu không hợp lệ'),
    body('schedule.*.endTime')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ kết thúc không hợp lệ'),
    body('schedule.*.room')
        .optional()
        .notEmpty().withMessage('Phòng học không được trống'),
    validate
];

module.exports = {
    validate,
    editUserValidate, addUserValidate,
    createClassValidate, updateClassValidate
}