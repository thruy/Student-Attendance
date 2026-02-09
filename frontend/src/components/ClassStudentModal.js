import { Modal, Button, Table, Form, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Trash3, PersonAdd } from 'react-bootstrap-icons';
import '../pages/timetable.css';

function ClassStudentModal({ show, onHide, classInfo }) {
    const [allStudents, setAllStudents] = useState([]);
    const [classStudents, setClassStudents] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && classInfo) {
            setClassStudents(classInfo.students || []);
        }
    }, [show, classInfo]);

    useEffect(() => {
        if (!show) return;
        if (!search.trim()) {
            setAllStudents([]);
            return;
        }
        const fetchStudents = async () => {
            setLoading(true);
            const res = await adminService.getStudentsForClassModal(search);
            setAllStudents(res.students);
            setLoading(false);
        };
        fetchStudents();
    }, [show, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(inputValue);
        }, 500); // delay 500ms

        return () => { clearTimeout(timer); };
    }, [inputValue]);

    const formatSchedule = (schedules) => {
        if (!Array.isArray(schedules)) return "Chưa cập nhật";
        return schedules.map(s => `${s.dayOfWeek}, ${s.startTime} – ${s.endTime}, phòng ${s.room}`).join(' | ');
    };

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

    const classStudentIds = classStudents.map(s => s.id);
    const availableStudents = allStudents.filter(
        s => !classStudentIds.includes(s._id)
    );

    const handleAdd = async () => {
        if (selectedIds.length === 0) return;
        await adminService.addStudentsToClass(classInfo.classId, selectedIds);
        const addedStudents = allStudents.filter(s =>
            selectedIds.includes(s._id)
        );

        setClassStudents(prev => [...prev, ...addedStudents]);
        setSelectedIds([]);
    };


    const handleRemove = async (studentId) => {
        await adminService.removeStudentFromClass(classInfo.classId, studentId);
        setClassStudents(prev => prev.filter(s => s.id !== studentId));
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Quản lý sinh viên trong lớp học</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Container>
                    <InfoRow label="Mã học phần:" value={classInfo?.subjectCode} />
                    <InfoRow label="Học phần:" value={classInfo?.name} />
                    <InfoRow label="Mã lớp học:" value={classInfo?.classCode} />
                    <InfoRow label="Loại lớp:" value={classInfo?.type} />
                    <InfoRow label="Học kỳ" value={classInfo?.semester} />
                    <InfoRow label="Lịch học" value={formatSchedule(classInfo?.schedule)} />
                    <InfoRow label="Giảng viên" value={classInfo?.teacher?.name} />
                    <InfoRow label="Email giảng viên" value={classInfo?.teacher?.email} />
                    <InfoRow label="Mã giảng viên" value={classInfo?.teacher?.code} />
                    <InfoRow label="Số lượng sinh viên" value={classInfo?.students?.length} />
                </Container>

                <Container>
                    <Form.Control placeholder="Tìm theo tên / MSSV" className="mb-3" value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />

                    {loading ? (
                        <div>
                            <Spinner animation="border" role="status"></Spinner>
                            <span>Đang tải thông tin...</span>
                        </div>
                    ) : (
                        <>
                            <h5>Kết quả tìm kiếm sinh viên</h5>
                            <Table hover size="sm">
                                <tbody>
                                    {availableStudents.map(s => (
                                        <tr key={s._id}>
                                            <td width="40">
                                                <Form.Check id={`${s._id}`}
                                                    checked={selectedIds.includes(s._id)}
                                                    onChange={(e) =>
                                                        setSelectedIds(prev =>
                                                            e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id)
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td>{s.code}</td>
                                            <td>{s.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <h6 className="mt-3">Sinh viên trong lớp</h6>
                            <Table hover size="sm">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>MSSV</th>
                                        <th>HỌ VÀ TÊN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classStudents.map((s, index) => (
                                        <tr key={s.id}>
                                            <td>{index + 1}</td>
                                            <td>{s.code}</td>
                                            <td>{s.name}</td>
                                            <td width="40">
                                                <Button variant='link' className="icon-btn delete" onClick={() => handleRemove(s.id)} ><Trash3 /> </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Container>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onClick={handleAdd}> Thêm sinh viên </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ClassStudentModal;