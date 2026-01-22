import { Modal, Row, Col, Container } from 'react-bootstrap';
import '../pages/timetable.css';

function StudentDetailModal({ show, onHide, student }) {
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
                <Modal.Title className='text-center'>Thông tin chi tiết sinh viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <InfoRow label="Họ và tên:" value={formatName(student.name)} />
                    <InfoRow label="Email:" value={student.email} />
                    <InfoRow label="Mã số sinh viên:" value={student.code} />
                    <InfoRow label="Ngày sinh:" value={formatDate(student.dob)} />
                    <InfoRow label="Giới tính:" value={student.gender} />
                    <InfoRow label="Dân tộc:" value={student.ethnic} />
                    <InfoRow label="Đại học:" value={student.university} />
                    <InfoRow label="Khoa/Viện:" value={student.school} />
                    <InfoRow label="Ngành:" value={student.branch} />
                    <InfoRow label="Lớp:" value={student.className} />
                    <InfoRow label="Khóa:" value={student.schoolYear} />
                    <InfoRow label="Hệ đào tạo:" value={student.trainingSystem} />
                    <InfoRow label="Quê quán:" value={student.hometown} />
                    <InfoRow label="Số căn cước công dân:" value={student.identificationNumber} />
                    <InfoRow label="Số điện thoại:" value={student.phone} />
                </Container>
            </Modal.Body>
        </Modal>
    )
}

export default StudentDetailModal;