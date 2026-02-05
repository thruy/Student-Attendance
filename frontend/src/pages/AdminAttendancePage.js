import { Button, Card, Container, Form, Table, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import adminService from "../services/adminService";
import { CheckCircle, XCircleFill } from 'react-bootstrap-icons';
import AttendanceModal from "../components/AttendanceModal";
import { useEffect, useState } from "react";
import './timetable.css';

function AttendancePage() {
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [scheduleDates, setScheduleDates] = useState(null);
    const [teacher, setTeacher] = useState({});

    const [attendanceDates, setAttendanceDates] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedDate, setSelectedDate] = useState(null);
    const [chooseAttendanceDate, setChooseAttendanceDate] = useState(false);
    const [deleteAttendanceDate, setDeleteAttendanceDate] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newAttendanceRecord, setNewAttendanceRecord] = useState([]);
    const [type, setType] = useState("");
    const { classId } = useParams();

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const data = await adminService.getClassDetail(classId);
                setClassInfo(data.class);
                setTeacher(data.class.teacher);
                setStudents(data.class.students);
                setAttendances(data.attendances);
                setScheduleDates(data.class.date);
                // build map
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
            } finally {
                setLoading(false);
            }
        }
        fetchAttendanceData();
    }, [classId]);


    const formatSchedule = (schedules) => {
        if (!Array.isArray(schedules)) return "Chưa cập nhật";
        return schedules.map(s => `${s.dayOfWeek}, ${s.startTime} – ${s.endTime}, phòng ${s.room}`).join(' | ');
    };

    const handleOpenAttendanceModal = (date) => {
        setSelectedDate(date);
        let records;
        const existed = attendances.find(a => new Date(a.date).toISOString().split("T")[0] === date);
        if (existed) {
            records = existed.records;
        } else {
            records = students.map(s => ({
                studentId: s.id,
                status: "yes",
            }));
        }
        setNewAttendanceRecord(records);
        setShowModal(true);
    }

    const handleSaveAttendance = async (records) => {
        try {
            await adminService.saveAttendance({ classId, date: selectedDate, type: type, records });
            const data = await adminService.getClassDetail(classId);
            setAttendances(data.attendances);
            // build map
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
            setShowModal(false);
            setSelectedDate(null);
        } catch (err) {
            setError("Lỗi lưu điểm danh");
        }
    };

    const deleteAttendance = async (date) => {
        if (!classId || !date) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa phiên điểm danh ngày ${date} không?`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            await adminService.deleteAttendance(classId, date);
            const data = await adminService.getClassDetail(classId);
            setAttendances(data.attendances);
            // build map
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
            setSelectedDate(null);
        } catch (err) {
            setError(`Xóa phiên điểm danh thất bại: ${err.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    };


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
                        <InfoRow label="Giảng viên" value={teacher?.name} />
                        <InfoRow label="Email giảng viên" value={teacher?.email} />
                        <InfoRow label="Mã giảng viên" value={teacher?.code} />
                        <InfoRow label="Số lượng sinh viên" value={students?.length} />
                    </Container>

                    <Container className="mt-4">
                        <Button variant="dark" onClick={() => { setChooseAttendanceDate(true); setDeleteAttendanceDate(false); setType("manual") }}>Điểm danh thủ công</Button>
                        <Button variant="dark" className="ms-2" disabled>Điểm danh tự động</Button>
                        <Button variant="dark" className="ms-2" onClick={() => { setChooseAttendanceDate(false); setDeleteAttendanceDate(true) }}>Xóa phiên điểm danh</Button>
                        {chooseAttendanceDate && (
                            <div className="d-flex align-items-center gap-3 mt-3">
                                <Form.Select
                                    value={selectedDate || ''}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="mt-3" style={{ width: '300px' }}
                                >
                                    <option value="">Chọn ngày điểm danh</option>
                                    {scheduleDates.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </Form.Select>
                                <Button className="mt-3" onClick={() => handleOpenAttendanceModal(selectedDate)} disabled={!selectedDate}>Bắt đầu</Button>
                            </div>
                        )}
                        {deleteAttendanceDate && (
                            <div className="d-flex align-items-center gap-3 mt-3">
                                <Form.Select
                                    value={selectedDate || ''}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="mt-3" style={{ width: '300px' }}
                                >
                                    <option value="">Xóa phiên ngày</option>
                                    {attendanceDates.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </Form.Select>
                                <Button className="mt-3" onClick={() => deleteAttendance(selectedDate)} disabled={!selectedDate}>Xóa</Button>
                            </div>
                        )}
                    </Container>

                    <Table bordered hover responsive className="timetable-table">
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
                                    <td className="text-center">{student.code}</td>
                                    {attendanceDates.map(date => (
                                        <td key={date} className="text-center">
                                            {attendanceMap[date]?.recordMap?.[student.id] === "yes" && <CheckCircle size={20} color="royalblue" />}
                                            {attendanceMap[date]?.recordMap?.[student.id] === "no" && <XCircleFill size={20} color="red" />}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {loading && (
                        <div>
                            <Spinner animation="border" role="status"></Spinner>
                            <span>Đang tải thông tin...</span>
                        </div>
                    )}

                    {error && (
                        <Alert variant="danger">
                            <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            <AttendanceModal show={showModal} onClose={() => setShowModal(false)} students={students} date={selectedDate} initialRecords={newAttendanceRecord} onSave={handleSaveAttendance} />
        </>
    )
}

export default AttendancePage;