import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button, Col, Row, Form, FormLabel, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import teacherService from '../services/teacherService';
import ClassInfoModal from '../components/ClassInfoModal';
import { formatSchedule } from '../utils/schedule';
import './timetable.css';

const SEMESTERS = ['20252', '20251', '20243', '20242', '20241', '20233', '20232', '20231'];

// khác biệt giữa thời khóa biểu của sinh viên và giảng viên
const CONFIG = {
    student: {
        fetchTimetable: studentService.getStudentTimetable,
        title: (name) => `Thời khóa biểu của ${name}`,
        emptySchedule: 'Bạn chưa có lịch học nào.',
        emptyTimetable: 'Bạn chưa có lịch!',
        infoHeader: 'GIẢNG VIÊN',
        infoValue: (item) => item.teacher?.name,
        actionHeader: 'GHI CHÚ',
        actionLabel: 'Chi tiết'
    },
    teacher: {
        fetchTimetable: teacherService.getTeacherTimetable,
        title: (name) => `Thời khóa biểu của giảng viên ${name}`,
        emptySchedule: 'Bạn chưa có lịch giảng dạy nào.',
        emptyTimetable: 'Không có lớp học nào!',
        infoHeader: 'SỐ SINH VIÊN',
        infoValue: (item) => item.numberOfStudents,
        actionHeader: 'THAO TÁC',
        actionLabel: 'Điểm danh'
    }
};

// role: 'student' | 'teacher'
function TimetablePage({ role }) {
    const config = CONFIG[role];
    const { user } = useAuth();
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState('20251');
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const data = await config.fetchTimetable();
                setTimetable(data.timetable);
            } catch (err) {
                setError('Lỗi khi tải thời khóa biểu.');
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, [config]);

    // sinh viên: xem chi tiết lớp; giảng viên: chuyển sang trang điểm danh
    const handleAction = async (classId) => {
        if (role === 'teacher') {
            navigate(`/teacher/teaching/attendance/${classId}`);
            return;
        }
        try {
            const data = await studentService.getInfoOfClass(classId);
            setSelectedClass(data.classInfo);
            setShowModal(true);
        } catch (err) {
            setError('Lỗi khi tải danh sách sinh viên.');
        }
    };

    if (loading) {
        return (
            <div>
                <Spinner animation="border" role="status"></Spinner>
                <span>Đang tải thông tin...</span>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )
    }

    if (timetable.length === 0) {
        return (
            <Alert variant="info">
                <Alert.Heading>{config.emptyTimetable}</Alert.Heading>
            </Alert>
        );
    }

    return (
        <div>
            <h2 className="timetable-title">{config.title(user.name)}</h2>
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
                            {SEMESTERS.map((item) => (
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
                        <th>{config.infoHeader}</th>
                        <th>LỊCH HỌC</th>
                        <th>{config.actionHeader}</th>
                    </tr>
                </thead>

                <tbody>
                    {timetable.map((item, index) => (
                        <tr key={item.classId}>
                            <td className="text-center fw-bold">{index + 1}</td>
                            <td className="subject-name">{item.name}</td>
                            <td>{item.subjectCode}</td>
                            <td>{item.classCode}</td>
                            <td>{item.type}</td>
                            <td>{config.infoValue(item)}</td>
                            <td className="schedule-cell">{formatSchedule(item.schedule, config.emptySchedule)}</td>
                            <td className="text-center">
                                <Button variant="outline-dark" onClick={() => handleAction(item.classId)}>{config.actionLabel}</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <ClassInfoModal show={showModal} handleClose={() => setShowModal(false)} selectedClass={selectedClass} />
        </div>
    );
}

export default TimetablePage;
