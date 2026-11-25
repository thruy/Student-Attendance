const { body } = require('express-validator');
const { validate } = require('./validate');
const { dateKeyInVN } = require('../utils/attendance');

// lưu toàn bộ kết quả chia lớp thi của một lớp học
const saveExamValidate = [
    body('maxPerRoom')
        .isInt({ min: 1 }).withMessage('Số sinh viên tối đa mỗi phòng phải là số nguyên dương')
        .toInt(),
    body('rooms')
        .isArray({ min: 1 }).withMessage('Phải có ít nhất một lớp thi')
        .custom(rooms => {
            const codes = rooms.map(r => String(r?.examCode ?? '').trim());
            if (new Set(codes).size !== codes.length) { throw new Error('Mã lớp thi bị trùng'); }
            return true;
        }),
    body('rooms.*.examCode')
        .isString().withMessage('Mã lớp thi không hợp lệ')
        .trim()
        .notEmpty().withMessage('Mã lớp thi không được để trống'),
    body('rooms.*.room')
        .isString().withMessage('Phòng thi không hợp lệ')
        .trim()
        .notEmpty().withMessage('Phòng thi không được để trống'),
    body('rooms.*.startTime')
        .isISO8601().withMessage('Thời gian bắt đầu không hợp lệ'),
    body('rooms.*.endTime')
        .isISO8601().withMessage('Thời gian kết thúc không hợp lệ')
        .custom((value, { req, path }) => {
            const index = Number(path.match(/\d+/)[0]);
            const startTime = new Date(req.body.rooms[index].startTime);
            if (new Date(value) <= startTime) {
                throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
            }
            // ngày thi dùng để giới hạn thời gian điểm danh
            if (!isNaN(startTime) && dateKeyInVN(value) !== dateKeyInVN(startTime)) {
                throw new Error('Thời gian bắt đầu và kết thúc phải trong cùng một ngày');
            }
            return true;
        }),
    body('rooms.*.invigilators')
        .isArray().withMessage('Danh sách cán bộ coi thi không hợp lệ'),
    body('rooms.*.invigilators.*')
        .isMongoId().withMessage('Cán bộ coi thi không hợp lệ'),
    body('rooms.*.students')
        .isArray().withMessage('Danh sách sinh viên không hợp lệ'),
    body('rooms.*.students.*')
        .isMongoId().withMessage('Sinh viên không hợp lệ'),
    validate
];

module.exports = { saveExamValidate };
