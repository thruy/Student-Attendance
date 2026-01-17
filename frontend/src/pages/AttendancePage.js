import { Button, Card, Container, Form, Table, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import teacherService from "../services/teacherService";
const { useEffect, useState } = require("react");


function AttendancePage() {
    const [classInfo, setClassInfo] = useState(null);
    const [dates, setDates] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const { classId } = useParams();

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const data = await teacherService.getAttendancePageData(classId);
                setClassInfo(data.class);
                setDates(data.dates);
                setStudents(data.students);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu điểm danh:', err);
            }
        }
        fetchAttendanceData();
    }, [classId]);

    const InfoRow = ({ label, value }) => (
        <Row className="mb-3 align-items-center">
            <Col md={4} className="fw-bold">{label}</Col>
            <Col md={8}>
                <div className="info-value">
                    {value || <span className="text-muted">Chưa cập nhật</span>}
                </div>
            </Col>
        </Row>
    );

    return (
        <Card className="container mt-5" style={{ width: "800px", marginBottom: "3rem" }}>
            <Card.Header as="h4" className="text-center">Thông tin chi tiết lớp học</Card.Header>
            <Card.Body className="p-4">
                <Container>
                    <Card.Title>{classInfo?.subjectCode} - {classInfo?.name}</Card.Title>
                    <InfoRow label="Mã lớp học" value={classInfo?.classCode} />
                    <InfoRow label="Loại lớp" value={classInfo?.type} />
                    <InfoRow label="Học kỳ" value={classInfo?.semester} />
                    <InfoRow label="Số lượng sinh viên" value={students.length} />
                </Container>

                <Container className="mt-4">
                    <Button variant="dark" onClick={() => setEditMode(true)}>Điểm danh thủ công</Button>
                    <Button className="ms-2" disabled>Điểm danh tự động</Button>
                    {editMode && (
                        <Form.Select value={selectedDate || ''} onChange={(e) => setSelectedDate(e.target.value)} className="mt-3" >
                            <option value="">Chọn ngày điểm danh</option>
                            {dates.map(date => (
                                <option key={date} value={date}>{date}</option>
                            ))}
                        </Form.Select>
                    )}
                </Container>

                <Table striped bordered hover className="mt-4">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Họ tên</th>
                            <th>MSSV</th>
                            <th>Email</th>
                            {dates.map(date => (
                                <th key={date}>{date}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student._id}>
                                <td>{index + 1}</td>
                                <td>{student.name}</td>
                                <td>{student.code}</td>
                                <td>{student.email}</td>

                                {dates.map(date => {
                                    const status = student.attendance[date];
                                    return (
                                        <td key={date} className="text-center">
                                            {!editMode || selectedDate !== date ? (
                                                status === 'yes' ? '✔️' : status === 'no' ? '❌' : ''
                                            ) : (
                                                <Form.Check type="checkbox" />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    )
}

export default AttendancePage;