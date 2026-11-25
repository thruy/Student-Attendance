import { useEffect, useState } from 'react';
import { Alert, Button, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import teacherService from '../services/teacherService';
import { formatDateTime, formatTime } from '../utils/exam';
import './timetable.css';

// lịch coi thi của giảng viên, mỗi dòng một lớp thi được phân công
function InvigilationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        teacherService.getMyInvigilations()
            .then(data => setExams(data.exams))
            .catch(() => setError('Lỗi khi tải lịch coi thi.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div>
                <Spinner animation="border" role="status"></Spinner>
                <span>Đang tải thông tin...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    if (exams.length === 0) {
        return (
            <Alert variant="info">
                <Alert.Heading>Bạn chưa được phân công coi thi!</Alert.Heading>
            </Alert>
        );
    }

    return (
        <div>
            <h2 className="timetable-title">Lịch coi thi của {user.name}</h2>
            <Table bordered hover responsive className="timetable-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>HỌC PHẦN</th>
                        <th>MÃ HỌC PHẦN</th>
                        <th>MÃ LỚP HỌC</th>
                        <th>MÃ LỚP THI</th>
                        <th>PHÒNG THI</th>
                        <th>THỜI GIAN</th>
                        <th>SĨ SỐ</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {exams.map((item, index) => (
                        <tr key={`${item.classId}-${item.examCode}`}>
                            <td className="text-center fw-bold">{index + 1}</td>
                            <td className="subject-name">{item.name}</td>
                            <td>{item.subjectCode}</td>
                            <td>{item.classCode}</td>
                            <td>{item.examCode}</td>
                            <td>{item.room}</td>
                            <td>{formatDateTime(item.startTime)} - {formatTime(item.endTime)}</td>
                            <td className="text-center">{item.numberOfStudents}</td>
                            <td className="text-center">
                                <Button
                                    variant="dark"
                                    size="sm"
                                    onClick={() => navigate(`/teacher/invigilation/${item.classId}/${encodeURIComponent(item.examCode)}`)}
                                >
                                    Điểm danh
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default InvigilationPage;
