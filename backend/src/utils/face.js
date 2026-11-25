const fs = require('fs/promises');
const path = require('path');

const DEFAULT_SERVICE_URL = 'http://127.0.0.1:5005';
const DEFAULT_UPLOAD_DIR = path.join(__dirname, '../../uploads/faces');
// ngưỡng khoảng cách cosine của Facenet512 (deepface/config/threshold.py)
const DEFAULT_THRESHOLD = 0.30;
// người khớp nhất phải gần hơn người thứ hai ít nhất margin, tránh nhận nhầm giữa 2 sinh viên giống nhau
const DEFAULT_MARGIN = 0.05;

// cho phép đặt giá trị 0 (vd FACE_MATCH_MARGIN=0 để tắt kiểm tra chênh lệch)
const numberEnv = (name, fallback) => {
    const value = Number(process.env[name]);
    return process.env[name] !== undefined && process.env[name] !== '' && Number.isFinite(value) ? value : fallback;
};

const getFaceConfig = () => ({
    serviceUrl: process.env.FACE_SERVICE_URL || DEFAULT_SERVICE_URL,
    serviceKey: process.env.FACE_SERVICE_KEY || '',
    uploadDir: path.resolve(process.env.FACE_UPLOAD_DIR || DEFAULT_UPLOAD_DIR),
    threshold: numberEnv('FACE_MATCH_THRESHOLD', DEFAULT_THRESHOLD),
    margin: numberEnv('FACE_MATCH_MARGIN', DEFAULT_MARGIN)
});

// tên file theo id người dùng + thời điểm tải lên (không dùng tên file người dùng gửi lên),
// mỗi lần tải một file riêng để 2 request đồng thời không ghi đè nhau; trả về đường dẫn tuyệt đối
const saveFacePhoto = async (userId, buffer) => {
    const { uploadDir } = getFaceConfig();
    const filePath = path.join(uploadDir, `${userId}-${Date.now()}.jpg`);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer, { flag: 'wx' });
    return filePath;
};

const removeFacePhoto = (photoPath) => (photoPath ? fs.rm(photoPath, { force: true }) : Promise.resolve());

const SERVICE_ERRORS = {
    BAD_IMAGE: 'Ảnh không hợp lệ hoặc quá lớn',
    NO_FACE: 'Không tìm thấy khuôn mặt trong ảnh',
    MULTIPLE_FACES: 'Ảnh có nhiều hơn một khuôn mặt',
    SPOOF: 'Phát hiện ảnh giả mạo (ảnh chụp lại, màn hình...)'
};

// lỗi có status + code để controller trả về cho client
class FaceServiceError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

// gửi bytes ảnh sang face-service, trả về { embedding, model, detector }
const requestEmbedding = async (buffer, { antiSpoofing = false } = {}) => {
    const { serviceUrl, serviceKey } = getFaceConfig();
    let res;
    try {
        res = await fetch(`${serviceUrl}/embed?anti_spoofing=${antiSpoofing ? 1 : 0}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream', Authorization: `Bearer ${serviceKey}` },
            body: buffer,
            signal: AbortSignal.timeout(60000)
        });
    } catch {
        throw new FaceServiceError(503, 'UNAVAILABLE', 'Dịch vụ nhận diện khuôn mặt chưa sẵn sàng');
    }

    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
    if (SERVICE_ERRORS[data.code]) throw new FaceServiceError(422, data.code, SERVICE_ERRORS[data.code]);
    console.error('face-service error:', res.status, data);
    throw new FaceServiceError(503, 'UNAVAILABLE', 'Dịch vụ nhận diện khuôn mặt chưa sẵn sàng');
};

const cosineDistance = (a, b) => {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return 1 - dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// candidates: [{ user, embedding }] -> người gần nhất và khoảng cách tới người gần thứ hai
const findBestMatch = (embedding, candidates) => {
    let best = null, distance = Infinity, secondDistance = Infinity;
    candidates.forEach(c => {
        const d = cosineDistance(embedding, c.embedding);
        if (d < distance) {
            secondDistance = distance;
            distance = d;
            best = c;
        } else if (d < secondDistance) {
            secondDistance = d;
        }
    });
    return { best, distance, secondDistance };
};

const faceMatches = ({ best, distance, secondDistance }) => {
    const { threshold, margin } = getFaceConfig();
    return !!best && distance <= threshold && secondDistance - distance >= margin;
};

// embedding cũ của mô hình khác không so được với embedding mới
const isComparable = (faceData, result) =>
    !!faceData?.embedding?.length && faceData.model === result.model && faceData.detector === result.detector;

module.exports = {
    getFaceConfig, saveFacePhoto, removeFacePhoto,
    FaceServiceError, requestEmbedding, cosineDistance, findBestMatch, faceMatches, isComparable
};
