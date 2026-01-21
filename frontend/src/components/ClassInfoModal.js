import { Modal, Row, Col, Table } from 'react-bootstrap';
import '../pages/timetable.css';

function ClassInfoModal({ show, handleClose, selectedClass, formatSchedule }) {
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

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Thông tin chi tiết lớp học</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedClass && (
                    <>
                        <h4>{selectedClass.subjectCode} - {selectedClass.name}</h4>
                        <InfoRow label="Mã lớp học" value={selectedClass.classCode} />
                        <InfoRow label="Loại lớp" value={selectedClass.type} />
                        <InfoRow label="Học kỳ" value={selectedClass.semester} />
                        <InfoRow label="Lịch học" value={formatSchedule(selectedClass.schedule)} />
                        <InfoRow label="Giảng viên" value={selectedClass.teacher.name} />
                        <InfoRow label="Email giảng viên" value={selectedClass.teacher.email} />
                        <InfoRow label="Mã giảng viên" value={selectedClass.teacher.code} />
                        <InfoRow label="Số lượng sinh viên" value={selectedClass.students.length} />
                        <h5 className="mt-4">Danh sách sinh viên</h5>
                        <Table bordered hover responsive className="timetable-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã số sinh viên</th>
                                    <th>Họ và tên</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedClass.students.map((student, index) => (
                                    <tr key={index}>
                                        <td className="text-center fw-bold">{index + 1}</td>
                                        <td className='text-center'>{student.code}</td>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </Modal.Body>
        </Modal>
    )
}

export default ClassInfoModal;