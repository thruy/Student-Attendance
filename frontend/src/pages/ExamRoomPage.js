import { Alert, Button, Card, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import teacherService from "../services/teacherService";
import adminService from "../services/adminService";
import ClassDetailCard from "../components/ClassDetailCard";
import ExamRoomCard from "../components/ExamRoomCard";
import {
    compareVietnameseName, splitIntoRooms, defaultExamCode,
    toDateTimeLocal, fromDateTimeLocal, formatExamErrors
} from "../utils/exam";

// khác biệt giữa trang chia lớp thi của giảng viên và admin
const CONFIG = {
    teacher: { service: teacherService, backPath: (classId) => `/teacher/teaching/attendance/${classId}` },
    admin: { service: adminService, backPath: (classId) => `/admin/class/${classId}` }
};

// role: 'teacher' | 'admin'
function ExamRoomPage({ role }) {
    const { service, backPath } = CONFIG[role];
    const { classId } = useParams();
    const navigate = useNavigate();
    const keyRef = useRef(0);

    const [classInfo, setClassInfo] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [maxPerRoom, setMaxPerRoom] = useState('');
    const [rooms, setRooms] = useState([]);
    const [hasSaved, setHasSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState('');

    // key chỉ dùng cho React list, không gửi lên backend
    const newRoom = useCallback((fields) => ({
        key: keyRef.current++,
        examCode: '', room: '', startTime: '', endTime: '', invigilators: [], students: [],
        ...fields
    }), []);

    // đưa kết quả đã lưu vào state, bỏ những sinh viên không còn trong lớp
    const applyExam = useCallback((exam, classStudents) => {
        const ids = new Set(classStudents.map(s => s.id));
        setMaxPerRoom(exam ? String(exam.maxPerRoom) : '');
        setRooms(exam ? exam.rooms.map(r => newRoom({
            ...r,
            startTime: toDateTimeLocal(r.startTime),
            endTime: toDateTimeLocal(r.endTime),
            students: r.students.filter(id => ids.has(id))
        })) : []);
        setHasSaved(!!exam);
    }, [newRoom]);

    useEffect(() => {
        service.getClassExam(classId)
            .then(res => {
                setClassInfo(res.class);
                setTeachers(res.teachers);
                applyExam(res.exam, res.class.students);
            })
            .catch(err => setErrors([err.response?.data?.message || 'Lỗi khi tải thông tin lớp thi']))
            .finally(() => setLoading(false));
    }, [service, classId, applyExam]);

    const students = useMemo(() => classInfo?.students || [], [classInfo]);
    const studentMap = useMemo(() => Object.fromEntries(students.map(s => [s.id, s])), [students]);
    const unassigned = useMemo(() => {
        const assigned = new Set(rooms.flatMap(r => r.students));
        return students.filter(s => !assigned.has(s.id)).sort(compareVietnameseName);
    }, [students, rooms]);

    const showErrors = (list) => { setSuccess(''); setErrors(list); };

    // chia đều theo thứ tự abc, giữ lại thông tin phòng/thời gian/cán bộ coi thi đã nhập theo thứ tự lớp thi
    const handleSplit = () => {
        const limit = Number(maxPerRoom);
        if (!Number.isInteger(limit) || limit < 1) {
            return showErrors(['Số sinh viên tối đa mỗi phòng phải là số nguyên dương']);
        }
        if (students.length === 0) {
            return showErrors(['Lớp học chưa có sinh viên nào']);
        }
        if (rooms.length > 0 && !window.confirm('Danh sách sinh viên trong các lớp thi sẽ được chia lại từ đầu. Tiếp tục?')) return;

        const groups = splitIntoRooms(students, limit);
        setRooms(prev => groups.map((group, i) => newRoom({
            ...prev[i],
            examCode: prev[i]?.examCode || defaultExamCode(classInfo.classCode, i),
            students: group
        })));
        setErrors([]);
        setSuccess('');
    };

    const updateRoom = (index, field, value) => {
        setRooms(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    };

    // target: chỉ số lớp thi đích, 'none' = bỏ khỏi mọi lớp thi
    const moveStudent = (studentId, target) => {
        if (target === '') return;
        setRooms(prev => prev.map((r, i) => {
            const ids = r.students.filter(id => id !== studentId);
            if (String(i) === target) ids.push(studentId);
            return { ...r, students: ids };
        }));
    };

    const addRoom = () => {
        setRooms(prev => [...prev, newRoom({ examCode: defaultExamCode(classInfo.classCode, prev.length) })]);
    };

    const removeRoom = (index) => {
        if (rooms[index].students.length > 0
            && !window.confirm('Sinh viên trong lớp thi này sẽ chuyển về danh sách chưa xếp lớp thi. Tiếp tục?')) return;
        setRooms(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (rooms.length === 0) return showErrors(['Chưa có lớp thi nào để lưu']);
        if (unassigned.length > 0
            && !window.confirm(`Còn ${unassigned.length} sinh viên chưa được xếp lớp thi. Vẫn lưu?`)) return;

        const payload = {
            maxPerRoom: Number(maxPerRoom),
            rooms: rooms.map(r => ({
                examCode: r.examCode,
                room: r.room,
                startTime: fromDateTimeLocal(r.startTime),
                endTime: fromDateTimeLocal(r.endTime),
                invigilators: r.invigilators,
                students: r.students
            }))
        };

        try {
            setSaving(true);
            const res = await service.saveClassExam(classId, payload);
            applyExam(res.exam, students);
            setErrors([]);
            setSuccess(res.message);
        } catch (err) {
            showErrors(formatExamErrors(err.response?.data));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách lớp thi đã lưu không?')) return;
        try {
            setSaving(true);
            const res = await service.deleteClassExam(classId);
            applyExam(null, students);
            setErrors([]);
            setSuccess(res.message);
        } catch (err) {
            showErrors([err.response?.data?.message || 'Lỗi khi xóa danh sách lớp thi']);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Spinner animation="border" role="status"></Spinner>
                <span>Đang tải thông tin...</span>
            </div>
        );
    }

    return (
        <ClassDetailCard classInfo={classInfo}>
            <Container className="mt-4">
                <h5 className="fw-bold">Chia lớp thi</h5>
                <Row className="align-items-end g-3">
                    <Col md={4}>
                        <Form.Label>Số sinh viên tối đa mỗi phòng</Form.Label>
                        <Form.Control type="number" min={1} value={maxPerRoom} onChange={(e) => setMaxPerRoom(e.target.value)} />
                    </Col>
                    <Col md="auto">
                        <Button variant="dark" onClick={handleSplit}>Chia lớp thi</Button>
                    </Col>
                    <Col className="text-muted">
                        Lớp có {students.length} sinh viên{rooms.length > 0 && `, đang chia thành ${rooms.length} lớp thi`}
                    </Col>
                </Row>

                {errors.length > 0 && (
                    <Alert variant="danger" className="mt-3" dismissible onClose={() => setErrors([])}>
                        {errors.map((e, i) => <div key={i}>{e}</div>)}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="mt-3" dismissible onClose={() => setSuccess('')}>{success}</Alert>
                )}

                {unassigned.length > 0 && rooms.length > 0 && (
                    <Card className="mt-4" border="warning">
                        <Card.Header className="fw-bold">Chưa xếp lớp thi ({unassigned.length} sinh viên)</Card.Header>
                        <Card.Body>
                            <Table bordered hover responsive size="sm" className="mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>STT</th>
                                        <th>Họ tên</th>
                                        <th>MSSV</th>
                                        <th style={{ width: '260px' }}>Xếp vào lớp thi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unassigned.map((student, i) => (
                                        <tr key={student.id}>
                                            <td className="text-center">{i + 1}</td>
                                            <td>{student.name}</td>
                                            <td className="text-center">{student.code}</td>
                                            <td>
                                                <Form.Select size="sm" value="" onChange={(e) => moveStudent(student.id, e.target.value)}>
                                                    <option value="">-- Chọn --</option>
                                                    {rooms.map((r, j) => (
                                                        <option key={r.key} value={j}>Lớp thi {j + 1}{r.examCode ? ` (${r.examCode})` : ''}</option>
                                                    ))}
                                                </Form.Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}

                {rooms.map((room, index) => (
                    <ExamRoomCard
                        key={room.key}
                        index={index}
                        room={room}
                        rooms={rooms}
                        studentMap={studentMap}
                        teachers={teachers}
                        maxPerRoom={Number(maxPerRoom)}
                        onChange={(field, value) => updateRoom(index, field, value)}
                        onMoveStudent={moveStudent}
                        onRemove={() => removeRoom(index)}
                    />
                ))}

                <div className="d-flex gap-2 mt-4">
                    <Button variant="outline-dark" onClick={() => navigate(backPath(classId))}>Quay lại</Button>
                    {rooms.length > 0 && <Button variant="outline-dark" onClick={addRoom}>Thêm lớp thi</Button>}
                    <div className="ms-auto d-flex gap-2">
                        {hasSaved && <Button variant="outline-danger" onClick={handleDelete} disabled={saving}>Xóa danh sách lớp thi</Button>}
                        <Button variant="dark" onClick={handleSave} disabled={saving || rooms.length === 0}>
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </div>
                </div>
            </Container>
        </ClassDetailCard>
    );
}

export default ExamRoomPage;
