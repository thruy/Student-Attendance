import { Modal, Row, Col, Container } from 'react-bootstrap';
import '../pages/timetable.css';

function TeacherDetailModal({ show, onHide, teacher }) {
    const InfoRow = ({ label, value }) => (
        <Row className="mb-3 align-items-center">
            <Col md={4} className="fw-bold">
                {label}
            </Col>
            <Col md={8}>
                <div className="info-value">
                    {value || <span className="text-muted">Chưa cập nhật</span>}
                </div>
            </Col>
        </Row>
    );

    const formatName = (name) => name?.toLowerCase().split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className='text-center'>Thông tin chi tiết giảng viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <InfoRow label="Họ và tên:" value={formatName(teacher.name)} />
                    <InfoRow label="Email:" value={teacher.email} />
                    <InfoRow label="Mã số giảng viên:" value={teacher.code} />
                    <InfoRow label="Ngày sinh:" value={formatDate(teacher.dob)} />
                    <InfoRow label="Giới tính:" value={teacher.gender} />
                    <InfoRow label="Dân tộc:" value={teacher.ethnic} />
                    <InfoRow label="Đại học:" value={teacher.university} />
                    <InfoRow label="Viện/Trường:" value={teacher.school} />
                    <InfoRow label="Khoa:" value={teacher.branch} />
                    <InfoRow label="Học vị:" value={teacher.trainingSystem} />
                    <InfoRow label="Quê quán:" value={teacher.hometown} />
                    <InfoRow label="Số căn cước công dân:" value={teacher.identificationNumber} />
                    <InfoRow label="Số điện thoại:" value={teacher.phone} />
                </Container>
            </Modal.Body>
        </Modal>
    )
}

export default TeacherDetailModal;