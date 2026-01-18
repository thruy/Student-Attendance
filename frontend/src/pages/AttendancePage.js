import { Button, Card, Container, Form, Table, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import teacherService from "../services/teacherService";
import { CheckCircle, XCircleFill } from 'react-bootstrap-icons';
import AttendanceModal from "../components/AttendanceModal";

const { useEffect, useState } = require("react");

function AttendancePage() {
    const [classInfo, setClassInfo] = useState(null);
    const [dates, setDates] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [attendanceDates, setAttendanceDates] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newAttendance, setNewAttendance] = useState(null)
    const { classId } = useParams();

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const data = await teacherService.getAttendancePageData(classId);
                console.log(data);
                setClassInfo(data.class);
                setDates(data.class.date);
                setStudents(data.class.students);
                setAttendances(data.attendances);
                const map = {};
                const dates = [];
                data.attendances.forEach(a => {
                    const dateKey = new Date(a.date).toISOString().split("T")[0];
                    dates.push(dateKey);

                    const recordMap = {};
                    a.records.forEach(r => {
                        recordMap[r.studentId] = r.status;
                    });
                    map[dateKey] = { recordMap };
                });
                dates.sort((a, b) => new Date(a) - new Date(b));
                setAttendanceDates(dates);
                setAttendanceMap(map);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu điểm danh:', err);
            }
        }
        fetchAttendanceData();
    }, [classId]);


    const formatSchedule = (schedules) => {
        if (!Array.isArray(schedules)) return "Chưa cập nhật";
        return schedules.map(s => `${s.dayOfWeek}, ${s.startTime} – ${s.endTime}, phòng ${s.room}`).join(' | ');
    };

    const handleCreateAttendance = async (selectedDate) => {
        try {
            setLoading(true);
            const data = await teacherService.createAttendanceSession(classId, selectedDate);
            setAttendances(prev => [...prev, data]);
            setNewAttendance(data);
            setShowModal(true);
        } catch {
            setError(err.response?.data?.message || 'Lỗi tạo phiên điểm danh')
        } finally {
            setLoading(false);
        }
    }

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
        <>
            <Card className="container mt-5" variant='dark' style={{ width: "100vw", marginBottom: "3rem" }}>
                <Card.Header as="h4" className="text-center">Thông tin chi tiết lớp học</Card.Header>
                <Card.Body className="p-4">
                    <Container>
                        <Card.Title>{classInfo?.subjectCode} - {classInfo?.name}</Card.Title>
                        <InfoRow label="Mã lớp học" value={classInfo?.classCode} />
                        <InfoRow label="Loại lớp" value={classInfo?.type} />
                        <InfoRow label="Học kỳ" value={classInfo?.semester} />
                        <InfoRow label="Lịch học" value={formatSchedule(classInfo?.schedule)} />
                        <InfoRow label="Số lượng sinh viên" value={students?.length} />
                    </Container>

                    <Container className="mt-4">
                        <Button variant="dark" onClick={() => setEditMode(true)}>Điểm danh thủ công</Button>
                        <Button variant="dark" className="ms-2" disabled>Điểm danh tự động</Button>
                        {editMode && (
                            <Form.Select
                                value={selectedDate || ''}
                                onChange={(e) => { const d = e.target.value; setSelectedDate(d); handleCreateAttendance(d) }}
                                className="mt-3" style={{ width: '300px' }}
                            >
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
                                {attendanceDates.map(date => (
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
                                    {attendanceDates.map(date => (
                                        <td key={date}>
                                            {attendanceMap[date]?.recordMap?.[student.id] === "yes" && <CheckCircle size={20} color="royalblue" />}
                                            {attendanceMap[date]?.recordMap?.[student.id] === "no" && <XCircleFill size={20} color="red" />}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>

                <Card.Footer>
                </Card.Footer>
            </Card>

            <AttendanceModal show={showModal} onClose={() => setShowModal(false)} students={students} date={selectedDate} initialRecords={newAttendance.records || []} onSave={handleSaveAttendance} loading={loading} />
        </>
    )
}

export default AttendancePage;