import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
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

    if (loading) {
        return (
            <div>
                <Spinner animation="border" role="status"></Spinner>
                <span>Đang tải thông tin...</span>
            </div>
        )
    }

    if (timetable.length === 0) {
        return <Alert variant="info">
            <Alert.Heading>Bạn chưa có lịch giảng dạy!</Alert.Heading>
        </Alert>;
    }

    if (error) {
        return (
            <Alert variant="secondary">
                <Alert.Heading>Lỗi khi tải dữ liệu</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )
    }

    return (
        <div>
            <h2 className="timetable-title">Thời khóa biểu của giảng viên {user.name}</h2>
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
                        <th>GHI CHÚ</th>
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

        </div>
    );
}

export default TeachingPage;