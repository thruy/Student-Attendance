const multer = require('multer');

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// frontend luôn chuyển ảnh sang JPEG (canvas) trước khi gửi, kiểm tra cả chữ ký file chứ không chỉ mimetype
const isJpeg = (buffer) => buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_PHOTO_BYTES, files: 1 }
}).single('photo');

// nhận 1 ảnh JPEG ở field "photo", lưu trong bộ nhớ (req.file.buffer)
const photoUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ảnh không được vượt quá 5MB' : 'Tải ảnh lên thất bại';
            return res.status(400).json({ message });
        }
        if (!req.file) { return res.status(400).json({ message: 'Thiếu ảnh' }); }
        if (!isJpeg(req.file.buffer)) { return res.status(400).json({ message: 'Ảnh phải ở định dạng JPEG' }); }
        next();
    });
};

module.exports = { photoUpload };
