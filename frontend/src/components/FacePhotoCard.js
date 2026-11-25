import { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Image, Spinner } from "react-bootstrap";
import studentService from "../services/studentService";
import { imageFileToJpeg } from "../utils/camera";

const PHOTO_STYLE = { maxWidth: '240px', maxHeight: '240px', objectFit: 'cover' };

// ảnh khuôn mặt của sinh viên để điểm danh lớp thi, chỉ tải lên 1 lần (muốn đổi phải nhờ admin xóa)
function FacePhotoCard() {
    const [status, setStatus] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        studentService.getFaceStatus()
            .then(setStatus)
            .catch(() => setError('Không tải được trạng thái ảnh khuôn mặt.'));
    }, []);

    // thu hồi URL xem trước cũ để không rò rỉ bộ nhớ
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const handleSelect = async (e) => {
        const file = e.target.files?.[0];
        setError('');
        setPhoto(null);
        setPreview('');
        if (!file) return;
        try {
            const jpeg = await imageFileToJpeg(file);
            setPhoto(jpeg);
            setPreview(URL.createObjectURL(jpeg));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpload = async () => {
        if (!window.confirm('Ảnh chỉ được tải lên một lần, muốn đổi phải liên hệ admin. Tiếp tục?')) return;
        setUploading(true);
        setError('');
        try {
            const res = await studentService.uploadFacePhoto(photo);
            setStatus({ registered: true, registeredAt: res.registeredAt });
            setPhoto(null);
            setPreview('');
        } catch (err) {
            setError(err.response?.data?.message || 'Tải ảnh lên thất bại.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="container mt-4" style={{ width: "800px", marginBottom: "3rem" }}>
            <Card.Header as="h5" className="text-center">ẢNH KHUÔN MẶT ĐIỂM DANH</Card.Header>
            <Card.Body className="p-4">
                {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                {!status && !error && <Spinner animation="border" size="sm" />}

                {status?.registered && (
                    <div className="d-flex gap-4 align-items-center">
                        <Image src={studentService.facePhotoUrl(status.registeredAt)} alt="Ảnh khuôn mặt" rounded style={PHOTO_STYLE} />
                        <div>
                            <p className="mb-2">
                                Đã đăng ký lúc <strong>{new Date(status.registeredAt).toLocaleString('vi-VN')}</strong>.
                            </p>
                            <p className="text-muted mb-0">Ảnh được dùng để điểm danh khi vào phòng thi. Muốn thay ảnh, vui lòng liên hệ admin.</p>
                        </div>
                    </div>
                )}

                {status && !status.registered && (
                    <>
                        <p className="mb-2">Tải lên một ảnh chân dung để điểm danh bằng khuôn mặt khi vào phòng thi:</p>
                        <ul className="text-muted">
                            <li>Chụp chính diện, đủ sáng, nhìn rõ toàn bộ khuôn mặt.</li>
                            <li>Chỉ có một mình bạn trong ảnh, không đeo khẩu trang hay kính râm.</li>
                            <li>Ảnh chỉ được tải lên một lần.</li>
                        </ul>
                        <Form.Control type="file" accept="image/*" onChange={handleSelect} disabled={uploading} style={{ maxWidth: '400px' }} />
                        {preview && (
                            <div className="mt-3 d-flex gap-3 align-items-end">
                                <Image src={preview} alt="Xem trước" rounded style={PHOTO_STYLE} />
                                <Button variant="dark" onClick={handleUpload} disabled={uploading}>
                                    {uploading && <Spinner animation="border" size="sm" className="me-2" />}
                                    Tải ảnh lên
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default FacePhotoCard;
