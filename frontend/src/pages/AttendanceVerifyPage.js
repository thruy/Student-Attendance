import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Modal, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import studentService from "../services/studentService";
import { getCurrentPosition, formatLocation } from "../utils/geolocation";

function AttendanceVerifyPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const isStudent = role === 'student';

    const [session, setSession] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [locating, setLocating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!isStudent) return;
        if (!token) {
            setLoadError('Đường dẫn điểm danh không hợp lệ (thiếu mã QR).');
            return;
        }
        studentService.getQrSessionInfo(token)
            .then(data => setSession(data.session))
            .catch(err => setLoadError(err.response?.data?.message || 'Không tải được thông tin phiên điểm danh.'));
    }, [token, isStudent]);

    const refreshLocation = useCallback(async () => {
        setLocating(true);
        setLocationError('');
        try {
            const loc = await getCurrentPosition();
            setLocation(loc);
            return loc;
        } catch (err) {
            setLocation(null);
            setLocationError(err.message);
            return null;
        } finally {
            setLocating(false);
        }
    }, []);

    const canCheckIn = session?.active && !session?.alreadyCheckedIn;
    useEffect(() => {
        if (canCheckIn) refreshLocation();
    }, [canCheckIn, refreshLocation]);

    const handleConfirm = async () => {
        setSubmitting(true);
        setResult(null);
        try {
            const loc = await refreshLocation();
            if (!loc && session.requiresLocation) return;
            const data = await studentService.checkInByQr({ token, ...(loc || {}) });
            setResult({ success: true, message: data.message });
            setSession(prev => ({ ...prev, alreadyCheckedIn: true }));
        } catch (err) {
            setResult({ success: false, message: err.response?.data?.message || 'Điểm danh thất bại, vui lòng thử lại.' });
        } finally {
            setSubmitting(false);
        }
    };

    const InfoRow = ({ label, children }) => (
        <Row className="mb-2">
            <Col xs={5} className="fw-bold">{label}</Col>
            <Col xs={7}>{children}</Col>
        </Row>
    );

    const renderBody = () => {
        if (!isStudent) {
            return <Alert variant="warning">Chỉ tài khoản sinh viên mới có thể điểm danh. Vui lòng đăng nhập bằng tài khoản sinh viên.</Alert>;
        }
        if (loadError) return <Alert variant="danger">{loadError}</Alert>;
        if (!session) {
            return <div className="text-center"><Spinner animation="border" /> <span>Đang tải thông tin...</span></div>;
        }
        return (
            <>
                <InfoRow label="Lớp học">{session.subjectCode} - {session.name} ({session.classCode})</InfoRow>
                <InfoRow label="Giảng viên">{session.teacherName}</InfoRow>
                <InfoRow label="Ngày điểm danh">{session.date}</InfoRow>
                <hr />
                <InfoRow label="Họ và tên">{user?.name}</InfoRow>
                <InfoRow label="Mã sinh viên">{user?.code}</InfoRow>
                {canCheckIn && (
                    <InfoRow label="Vị trí hiện tại">
                        {locating && <span><Spinner animation="border" size="sm" /> Đang lấy vị trí...</span>}
                        {!locating && location && formatLocation(location)}
                        {!locating && !location && <span className="text-danger">{locationError || 'Chưa có vị trí'}</span>}
                        {!locating && (
                            <Button variant="link" size="sm" className="p-0 ms-2" onClick={refreshLocation}>Lấy lại</Button>
                        )}
                    </InfoRow>
                )}

                {!session.active && !result && <Alert variant="secondary" className="mt-3">Phiên điểm danh đã kết thúc hoặc hết hạn.</Alert>}
                {session.alreadyCheckedIn && !result && <Alert variant="info" className="mt-3">Bạn đã điểm danh buổi học này.</Alert>}
                {result && <Alert variant={result.success ? 'success' : 'danger'} className="mt-3">{result.message}</Alert>}
            </>
        );
    };

    return (
        <Modal show centered backdrop="static" onHide={() => navigate('/student')}>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận điểm danh</Modal.Title>
            </Modal.Header>
            <Modal.Body>{renderBody()}</Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => navigate('/student')}>Về trang chủ</Button>
                {isStudent && canCheckIn && (
                    <Button variant="success" onClick={handleConfirm} disabled={submitting || locating}>
                        {submitting && <Spinner animation="border" size="sm" className="me-2" />}
                        Xác nhận điểm danh
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default AttendanceVerifyPage;
