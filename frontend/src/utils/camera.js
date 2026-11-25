// ảnh gửi lên backend luôn là JPEG (backend chỉ nhận JPEG), thu nhỏ để giảm dung lượng và bỏ metadata (EXIF, GPS)
const MAX_SIZE = 1024;
const JPEG_QUALITY = 0.9;

const ERROR_MESSAGES = {
    NotAllowedError: 'Bạn đã từ chối quyền truy cập camera. Hãy cho phép truy cập camera trong cài đặt trình duyệt.',
    NotFoundError: 'Không tìm thấy camera trên thiết bị.',
    NotReadableError: 'Camera đang được ứng dụng khác sử dụng.'
};

export const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ camera (yêu cầu HTTPS hoặc localhost).');
    }
    try {
        return await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
    } catch (err) {
        throw new Error(ERROR_MESSAGES[err.name] || 'Không mở được camera.');
    }
};

export const stopCamera = (stream) => {
    stream?.getTracks().forEach(track => track.stop());
};

// vẽ source (video / ảnh) lên canvas, cạnh dài nhất tối đa MAX_SIZE, xuất JPEG
const toJpeg = (source, width, height) => new Promise((resolve, reject) => {
    const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Không xử lý được ảnh.'))), 'image/jpeg', JPEG_QUALITY);
});

export const captureFrame = (video) => {
    if (!video?.videoWidth) return Promise.reject(new Error('Camera chưa sẵn sàng.'));
    return toJpeg(video, video.videoWidth, video.videoHeight);
};

// file ảnh người dùng chọn (jpg, png, heic nếu trình duyệt đọc được...) -> Blob JPEG
export const imageFileToJpeg = async (file) => {
    const bitmap = await createImageBitmap(file).catch(() => {
        throw new Error('Không đọc được file ảnh, hãy chọn ảnh JPG hoặc PNG.');
    });
    try {
        return await toJpeg(bitmap, bitmap.width, bitmap.height);
    } finally {
        bitmap.close();
    }
};
