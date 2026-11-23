import { Badge, Button, Card, Col, CloseButton, Form, Row, Table } from "react-bootstrap";
import { compareVietnameseName } from "../utils/exam";

// thông tin + danh sách sinh viên của một lớp thi, các thay đổi đẩy lên ExamRoomPage
function ExamRoomCard({ index, room, rooms, studentMap, teachers, maxPerRoom, onChange, onMoveStudent, onRemove }) {
    const students = room.students
        .map(id => studentMap[id])
        .filter(Boolean)
        .sort(compareVietnameseName);
    const overCapacity = maxPerRoom > 0 && students.length > maxPerRoom;

    const teacherMap = Object.fromEntries(teachers.map(t => [t._id, t]));
    const availableTeachers = teachers.filter(t => !room.invigilators.includes(t._id));

    const addInvigilator = (teacherId) => {
        if (teacherId) onChange('invigilators', [...room.invigilators, teacherId]);
    };
    const removeInvigilator = (teacherId) => {
        onChange('invigilators', room.invigilators.filter(id => id !== teacherId));
    };

    return (
        <Card className="mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                    Lớp thi {index + 1}
                    <Badge bg={overCapacity ? 'warning' : 'secondary'} text={overCapacity ? 'dark' : undefined} className="ms-2">
                        {students.length} sinh viên
                    </Badge>
                    {overCapacity && <span className="ms-2 text-warning-emphasis small">Vượt quá số sinh viên tối đa</span>}
                </span>
                <Button variant="outline-danger" size="sm" onClick={onRemove}>Xóa lớp thi</Button>
            </Card.Header>
            <Card.Body>
                <Row className="g-3">
                    <Col md={3}>
                        <Form.Label>Mã lớp thi</Form.Label>
                        <Form.Control value={room.examCode} onChange={(e) => onChange('examCode', e.target.value)} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Phòng thi</Form.Label>
                        <Form.Control value={room.room} placeholder="VD: D9-101" onChange={(e) => onChange('room', e.target.value)} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Bắt đầu</Form.Label>
                        <Form.Control type="datetime-local" value={room.startTime} onChange={(e) => onChange('startTime', e.target.value)} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Kết thúc</Form.Label>
                        <Form.Control type="datetime-local" value={room.endTime} onChange={(e) => onChange('endTime', e.target.value)} />
                    </Col>
                    <Col md={12}>
                        <Form.Label>Cán bộ coi thi</Form.Label>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            {room.invigilators.map(id => (
                                <Badge key={id} bg="light" text="dark" className="border d-flex align-items-center gap-2 py-2">
                                    {teacherMap[id] ? `${teacherMap[id].name} (${teacherMap[id].code})` : 'Giảng viên không tồn tại'}
                                    <CloseButton style={{ fontSize: '0.6rem' }} onClick={() => removeInvigilator(id)} />
                                </Badge>
                            ))}
                            <Form.Select value="" onChange={(e) => addInvigilator(e.target.value)} style={{ width: '300px' }}>
                                <option value="">+ Thêm cán bộ coi thi</option>
                                {availableTeachers.map(t => (
                                    <option key={t._id} value={t._id}>{t.name} - {t.code}</option>
                                ))}
                            </Form.Select>
                        </div>
                    </Col>
                </Row>

                <Table bordered hover responsive size="sm" className="mt-3 mb-0">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>STT</th>
                            <th>Họ tên</th>
                            <th>MSSV</th>
                            <th style={{ width: '260px' }}>Chuyển lớp thi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, i) => (
                            <tr key={student.id}>
                                <td className="text-center">{i + 1}</td>
                                <td>{student.name}</td>
                                <td className="text-center">{student.code}</td>
                                <td>
                                    <Form.Select size="sm" value="" onChange={(e) => onMoveStudent(student.id, e.target.value)}>
                                        <option value="">-- Chọn --</option>
                                        {rooms.map((r, j) => j !== index && (
                                            <option key={r.key} value={j}>Lớp thi {j + 1}{r.examCode ? ` (${r.examCode})` : ''}</option>
                                        ))}
                                        <option value="none">Bỏ khỏi lớp thi</option>
                                    </Form.Select>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr><td colSpan={4} className="text-center text-muted">Chưa có sinh viên</td></tr>
                        )}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}

export default ExamRoomCard;
