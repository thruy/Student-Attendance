import { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { getCurrentPosition } from "../utils/geolocation";
import { todayInVN } from "../utils/date";

function QrSessionStartModal({ show, onClose, onStart }) {
    const [duration, setDuration] = useState(15);
    const [checkLocation, setCheckLocation] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const today = todayInVN();

    const handleClose = () => {
        setError('');
        onClose();
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        setError('');
        try {
            let location = {};
            if (checkLocation) {
                try {
                    location = await getCurrentPosition();
                } catch (err) {
                    setError(`${err.message} Bỏ chọn "Kiểm tra vị trí sinh viên" nếu muốn tiếp tục mà không dùng vị trí.`);
                    return;
                }
            }
            await onStart({ date: today, duration: Number(duration), ...location });
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tạo phiên điểm danh');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Điểm danh tự động bằng QR</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3">
                    <Form.Label>Ngày điểm danh</Form.Label>
                    <Form.Control type="date" value={today} readOnly disabled />
                    <Form.Text muted>Điểm danh QR chỉ áp dụng cho ngày hôm nay.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Thời gian hiệu lực (phút)</Form.Label>
                    <Form.Control type="number" min={1} max={180} value={duration} onChange={(e) => setDuration(e.target.value)} />
                </Form.Group>
                <Form.Check
                    type="checkbox"
                    id="qr-check-location"
                    label="Kiểm tra vị trí sinh viên (dùng vị trí hiện tại của bạn làm tâm)"
                    checked={checkLocation}
                    onChange={(e) => setCheckLocation(e.target.checked)}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleClose} disabled={submitting}>Hủy</Button>
                <Button variant="success" onClick={handleConfirm} disabled={submitting || !(duration >= 1 && duration <= 180)}>
                    {submitting && <Spinner animation="border" size="sm" className="me-2" />}
                    Bắt đầu điểm danh
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default QrSessionStartModal;
