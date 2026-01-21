import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import studentService from '../services/studentService';
import ClassInfoModal from '../components/ClassInfoModal';
import './timetable.css';

function StudyPage() {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

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
            return 'Bạn chưa có lịch học nào.';
        }
        const sorted = sortSchedulesByDay(schedules);
        return sorted.map(s => `${s.dayOfWeek}, ${s.startTime}–${s.endTime}, phòng ${s.room}`).join(' | ');
    };

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const data = await studentService.getStudentTimetable();
                setTimetable(data.timetable);
            } catch (err) {
                setError('Lỗi khi tải thời khóa biểu.', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    const getInfoOfClass = async (id) => {
        try {
            const data = await studentService.getInfoOfClass(id);
            setShowModal(true);
            setSelectedClass(data.classInfo);
            return data;
        } catch (err) {
            setError('Lỗi khi tải danh sách sinh viên.', err);
        }
    }

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
            <Alert.Heading>Bạn chưa có lịch!</Alert.Heading>
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
            <h2 className="timetable-title">Thời khóa biểu của {user.name}</h2>
            <Table bordered hover responsive className="timetable-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>HỌC PHẦN</th>
                        <th>MÃ HỌC PHẦN</th>
                        <th>MÃ LỚP HỌC</th>
                        <th>LOẠI LỚP</th>
                        <th>GIẢNG VIÊN</th>
                        <th>LỊCH HỌC</th>
                        <th>GHI CHÚ</th>
                    </tr>
                </thead>

                <tbody>
                    {timetable.map((item, index) => (
                        <tr key={index}>
                            <td className="text-center fw-bold">{index + 1}</td>
                            <td className="subject-name"> {item.name}</td>
                            <td>{item.subjectCode}</td>
                            <td>{item.classCode}</td>
                            <td>{item.type} </td>
                            <td>{item.teacher.name}</td>
                            <td className="schedule-cell">{formatSchedule(item.schedule)}</td>
                            <td className="text-center">
                                <Button variant="outline-dark" onClick={() => getInfoOfClass(item.classId)}>Chi tiết</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <ClassInfoModal show={showModal} handleClose={() => setShowModal(false)} selectedClass={selectedClass} formatSchedule={formatSchedule} />
        </div>
    );
}
export default StudyPage;
