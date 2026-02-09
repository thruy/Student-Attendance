import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button, Row, Col, Form, FormLabel, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import teacherService from '../services/teacherService';
import { useNavigate } from 'react-router-dom';
import './timetable.css'

function TeachingPage() {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const navigate = useNavigate();
    const [selectedSemester, setSelectedSemester] = useState('20251');
    const [inputValue, setInputValue] = useState('');
    const semesters = ['20252', '20251', '20243', '20242', '20241', '20233', '20232', '20231'];

    const dayOrder = {
        'Thứ Hai': 1,
        'Thứ Ba': 2,
        'Thứ Tư': 3,
        'Thứ Năm': 4,
        'Thứ Sáu': 5,
        'Thứ Bảy': 6,
        'Chủ Nhật': 7
    };

    const sortSchedulesByDay = (schedules) => {
        return [...schedules].sort(
            (a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]
        );
    };

    const formatSchedule = (schedules) => {
        if (!schedules || schedules.length === 0) {
            return 'Bạn chưa có lịch giảng dạy nào.';
        }
        const sorted = sortSchedulesByDay(schedules);
        return sorted.map(s => `${s.dayOfWeek}, ${s.startTime} – ${s.endTime}, phòng ${s.room}`).join(' | ');
    };

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const data = await teacherService.getTeacherTimetable();
                setTimetable(data.timetable);
            } catch (err) {
                setError('Lỗi khi tải thời khóa biểu.', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    return (
        <div>
            <h2 className="timetable-title">Thời khóa biểu của giảng viên {user.name}</h2>
            <div>
                <Row className='align-items-center'>
                    <Col md={2}>
                        <FormLabel className='fw-bold ms-1'>Học kỳ</FormLabel>
                    </Col>
                    <Col md={10}></Col>
                </Row>

                <Row className="align-items-center mb-4">
                    <Col md={4}>
                        <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="semester-select" >
                            {semesters.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    {/* Search */}
                    <Col md={8}>
                        <InputGroup className="student-search">
                            <InputGroup.Text><Search /></InputGroup.Text>
                            <Form.Control type="text" placeholder="Tìm kiếm" value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
                        </InputGroup>
                    </Col>
                </Row>
            </div>
            <Table bordered hover responsive className="timetable-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>HỌC PHẦN</th>
                        <th>MÃ HỌC PHẦN</th>
                        <th>MÃ LỚP HỌC</th>
                        <th>LOẠI LỚP</th>
                        <th>SỐ SINH VIÊN</th>
                        <th>LỊCH HỌC</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {timetable.map((item, index) => (
                        <tr key={index}>
                            <td className="text-center fw-bold">{index + 1}</td>
                            <td><strong>{item.name}</strong></td>
                            <td>{item.subjectCode}</td>
                            <td>{item.classCode}</td>
                            <td>{item.type}</td>
                            <td>{item.numberOfStudents}</td>
                            <td className="schedule-cell">{formatSchedule(item.schedule)}</td>
                            <td className="text-center">
                                <Button variant="outline-dark" onClick={() => navigate(`/teacher/teaching/attendance/${item.classId}`)}>Điểm danh</Button>
                            </td>
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

            {timetable.length === 0 && (
                <Alert variant="info">
                    <Alert.Heading>Không có lớp học nào!</Alert.Heading>
                </Alert>
            )}

            {error && (
                <Alert variant="danger">
                    <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}
        </div>
    );
}

export default TeachingPage;