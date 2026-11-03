import { Button, Card, Container, Form, Table, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import teacherService from "../services/teacherService";
import { CheckCircle, XCircleFill } from 'react-bootstrap-icons';
import AttendanceModal from "../components/AttendanceModal";
import QrSessionStartModal from "../components/QrSessionStartModal";
import QrSessionPanel from "../components/QrSessionPanel";
import { useCallback, useEffect, useState } from "react";
import './timetable.css';

const QR_POLLING_INTERVAL = 4000;

const buildAttendanceMap = (attendances) => {
    const map = {};
    const dates = [];
    attendances.forEach(a => {
        const dateKey = new Date(a.date).toISOString().split("T")[0];
        dates.push(dateKey);

        const recordMap = {};
        a.records.forEach(r => {
            recordMap[r.studentId] = r.status;
        });
        map[dateKey] = { recordMap };
    });
    dates.sort((a, b) => new Date(a) - new Date(b));
    return { dates, map };
};

function AttendancePage() {
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [teacher, setTeacher] = useState({});

    const [attendanceDates, setAttendanceDates] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedDate, setSelectedDate] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newAttendanceRecord, setNewAttendanceRecord] = useState([]);
    const [type, setType] = useState("");

    const [qrSession, setQrSession] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const { classId } = useParams();

    const loadData = useCallback(async () => {
        const data = await teacherService.getAttendancePageData(classId);
        setClassInfo(data.class);
        setTeacher(data.class.teacher);
        setStudents(data.class.students);
        setAttendances(data.attendances);
        setQrSession(data.qrSession);
        const { dates, map } = buildAttendanceMap(data.attendances);
        setAttendanceDates(dates);
        setAttendanceMap(map);
    }, [classId]);

    useEffect(() => {
        loadData()
            .catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err))
            .finally(() => setLoading(false));
    }, [loadData]);

    // khi có phiên QR đang diễn ra, định kỳ tải lại để cập nhật sinh viên đã điểm danh
    const qrActive = !!qrSession;
    useEffect(() => {
        if (!qrActive) return;
        const timer = setInterval(() => {
            loadData().catch(err => console.error('Lỗi khi cập nhật điểm danh QR:', err));
        }, QR_POLLING_INTERVAL);
        return () => clearInterval(timer);
    }, [qrActive, loadData]);

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
            await teacherService.saveAttendance({ classId, date: selectedDate, type: type, records })
            await loadData();
            setShowModal(false);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi lưu điểm danh");
        }
    };

    const handleStartQrSession = async (payload) => {
        const data = await teacherService.startQrSession(classId, payload);
        setQrSession(data.session);
        setShowQrModal(false);
        setEditMode(false);
        await loadData();
    };

    const handleEndQrSession = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn kết thúc phiên điểm danh QR không?')) return;
        try {
            await teacherService.endQrSession(classId);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết thúc phiên điểm danh");
        }
        await loadData().catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err));
    };

    const handleQrExpire = useCallback(() => {
        loadData().catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err));
    }, [loadData]);

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
                        <Button variant="dark" onClick={() => { setEditMode(true); setType("manual") }} disabled={qrActive}>Điểm danh thủ công</Button>
                        <Button variant="dark" className="ms-2" onClick={() => setShowQrModal(true)} disabled={qrActive}>Điểm danh tự động</Button>
                        {editMode && !qrActive && (
                            <div className="d-flex align-items-center gap-3 mt-3">
                                <Form.Control
                                    type="date"
                                    value={selectedDate || ''}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="mt-3" style={{ width: '300px' }}
                                />
                                <Button className="mt-3" onClick={() => handleOpenAttendanceModal(selectedDate)} disabled={!selectedDate}>Bắt đầu</Button>
                            </div>
                        )}
                    </Container>

                    {qrSession && (
                        <QrSessionPanel session={qrSession} onEnd={handleEndQrSession} onExpire={handleQrExpire} />
                    )}

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
                                <tr key={student.id}>
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
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            <AttendanceModal show={showModal} onClose={() => setShowModal(false)} students={students} date={selectedDate} initialRecords={newAttendanceRecord} onSave={handleSaveAttendance} />
            <QrSessionStartModal show={showQrModal} onClose={() => setShowQrModal(false)} onStart={handleStartQrSession} />
        </>
    )
}

export default AttendancePage;
