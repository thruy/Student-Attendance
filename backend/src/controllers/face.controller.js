const mongoose = require('mongoose');
const User = require('../models/Users');
const { saveFacePhoto, removeFacePhoto, requestEmbedding, FaceServiceError } = require('../utils/face');

const PHOTO_HEADERS = { 'Cache-Control': 'private, no-store' };

const sendFaceError = (res, err, fallback) => {
    if (err instanceof FaceServiceError) {
        return res.status(err.status).json({ code: err.code, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: fallback });
};

const findStudentFace = (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return User.findOne({ _id: id, role: 'student' }).select('+faceData');
};

// trả ảnh khuôn mặt qua API có kiểm tra quyền, file nằm ngoài thư mục public
const sendPhoto = (res, student) => {
    if (!student?.faceData?.photoPath) {
        return res.status(404).json({ message: 'Sinh viên chưa đăng ký ảnh khuôn mặt' });
    }
    res.set(PHOTO_HEADERS).sendFile(student.faceData.photoPath, (err) => {
        if (err && !res.headersSent) res.status(404).json({ message: 'Không tìm thấy ảnh khuôn mặt' });
    });
};

// ===== sinh viên =====

const getMyFace = async (req, res) => {
    try {
        const student = await findStudentFace(req.user.userId);
        if (!student) { return res.status(404).json({ message: 'Không tìm thấy sinh viên' }); }
        res.status(200).json({
            registered: !!student.faceData?.embedding?.length,
            registeredAt: student.faceData?.registeredAt || null
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin khuôn mặt', error: err.message });
    }
};

// sinh viên chỉ tải ảnh 1 lần, muốn đổi phải nhờ admin xóa
const uploadMyFace = async (req, res) => {
    const { userId } = req.user;
    let savedPath = null;
    try {
        const student = await findStudentFace(userId);
        if (!student) { return res.status(404).json({ message: 'Không tìm thấy sinh viên' }); }
        if (student.faceData?.embedding?.length) {
            return res.status(409).json({ message: 'Bạn đã tải ảnh khuôn mặt, liên hệ admin để thay ảnh' });
        }

        // ảnh đăng ký là ảnh tĩnh nên không bật chống giả mạo (dễ báo nhầm)
        const result = await requestEmbedding(req.file.buffer, { antiSpoofing: false });
        savedPath = await saveFacePhoto(userId, req.file.buffer);

        // chỉ ghi khi chưa đăng ký, tránh 2 request tải lên cùng lúc
        const now = new Date();
        const updated = await User.updateOne(
            { _id: userId, 'faceData.embedding.0': { $exists: false } },
            {
                $set: {
                    faceData: {
                        embedding: result.embedding,
                        model: result.model,
                        detector: result.detector,
                        photoPath: savedPath,
                        registeredAt: now
                    }
                }
            }
        );
        if (updated.modifiedCount === 0) {
            await removeFacePhoto(savedPath);
            return res.status(409).json({ message: 'Bạn đã tải ảnh khuôn mặt, liên hệ admin để thay ảnh' });
        }
        res.status(201).json({ message: 'Đăng ký ảnh khuôn mặt thành công', registered: true, registeredAt: now });
    } catch (err) {
        await removeFacePhoto(savedPath).catch(() => {});
        sendFaceError(res, err, 'Lỗi khi đăng ký ảnh khuôn mặt');
    }
};

const getMyFacePhoto = async (req, res) => {
    try {
        sendPhoto(res, await findStudentFace(req.user.userId));
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy ảnh khuôn mặt', error: err.message });
    }
};

// ===== admin =====

const getStudentFacePhoto = async (req, res) => {
    try {
        sendPhoto(res, await findStudentFace(req.params.id));
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy ảnh khuôn mặt', error: err.message });
    }
};

// xóa ảnh + embedding để sinh viên tải lại
const deleteStudentFace = async (req, res) => {
    try {
        const student = await findStudentFace(req.params.id);
        if (!student) { return res.status(404).json({ message: 'Không tìm thấy sinh viên' }); }
        if (!student.faceData) { return res.status(404).json({ message: 'Sinh viên chưa đăng ký ảnh khuôn mặt' }); }

        await User.updateOne({ _id: student._id }, { $unset: { faceData: 1 } });
        await removeFacePhoto(student.faceData.photoPath);
        res.status(200).json({ message: 'Đã xóa ảnh khuôn mặt, sinh viên có thể tải ảnh mới' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa ảnh khuôn mặt', error: err.message });
    }
};

module.exports = { getMyFace, uploadMyFace, getMyFacePhoto, getStudentFacePhoto, deleteStudentFace, sendFaceError };
