import { useEffect, useState } from 'react';
import { Alert, Spinner, Table } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import studentService from '../services/studentService';
import { formatDateTime, formatTime } from '../utils/exam';
import './timetable.css';

// lịch thi của sinh viên, lấy từ các lớp thi đã được giảng viên/admin lưu
function ExamSchedulePage() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        studentService.getMyExams()
            .then(data => setExams(data.exams))
            .catch(() => setError('Lỗi khi tải lịch thi.'))
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
                <Alert.Heading>Bạn chưa có lịch thi nào!</Alert.Heading>
            </Alert>
        );
    }

    return (
        <div>
            <h2 className="timetable-title">Lịch thi của {user.name}</h2>
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
                        <th>CÁN BỘ COI THI</th>
                        <th>SĨ SỐ</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.map((item, index) => (
                        <tr key={item.classId}>
                            <td className="text-center fw-bold">{index + 1}</td>
                            <td className="subject-name">{item.name}</td>
                            <td>{item.subjectCode}</td>
                            <td>{item.classCode}</td>
                            <td>{item.examCode}</td>
                            <td>{item.room}</td>
                            <td>{formatDateTime(item.startTime)} - {formatTime(item.endTime)}</td>
                            <td>{item.invigilators.map(t => t.name).join(', ') || 'Chưa phân công'}</td>
                            <td className="text-center">{item.numberOfStudents}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default ExamSchedulePage;
