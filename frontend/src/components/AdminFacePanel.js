import { useState } from "react";
import { Alert, Button, Image } from "react-bootstrap";
import adminService from "../services/adminService";

// trạng thái ảnh khuôn mặt của sinh viên trong modal chi tiết (admin), cho phép xóa để sinh viên tải lại
function AdminFacePanel({ student, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!window.confirm(`Xóa ảnh khuôn mặt của ${student.name}? Sinh viên sẽ phải tải ảnh mới để điểm danh bằng khuôn mặt.`)) return;
        setDeleting(true);
        setError('');
        try {
            await adminService.deleteStudentFace(student._id);
            onDeleted();
        } catch (err) {
            setError(err.response?.data?.message || 'Xóa ảnh khuôn mặt thất bại.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mt-3 pt-3 border-top">
            <h6 className="fw-bold">Ảnh khuôn mặt điểm danh</h6>
            {error && <Alert variant="danger">{error}</Alert>}
            {student.faceRegistered ? (
                <div className="d-flex gap-4 align-items-center">
                    <Image
                        src={adminService.studentFacePhotoUrl(student._id, student.faceRegisteredAt)}
                        alt="Ảnh khuôn mặt" rounded
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                    />
                    <div>
                        <p className="mb-2">Đăng ký lúc {new Date(student.faceRegisteredAt).toLocaleString('vi-VN')}</p>
                        <Button variant="outline-danger" size="sm" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Đang xóa...' : 'Xóa ảnh khuôn mặt'}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-muted mb-0">Sinh viên chưa tải ảnh khuôn mặt.</p>
            )}
        </div>
    );
}

export default AdminFacePanel;
