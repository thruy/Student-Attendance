import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import studentService from '../services/studentService';
import ClassInfoModal from '../components/ClassInfoModal';

function StudyPage() {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    //const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    //const [teacher, setTeacher] = useState(null);

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
            //setStudents(data.classInfo.students);
            setSelectedClass(data.classInfo);
            //setTeacher(data.classInfo.teacher);
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
            <h2>Thời khóa biểu của {user.name}</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Học phần</th>
                        <th>Mã học phần</th>
                        <th>Mã lớp học</th>
                        <th>Loại lớp</th>
                        <th>Giảng viên</th>
                        <th>Lịch học</th>
                        <th>Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {timetable.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.subjectCode}</td>
                            <td>{item.classCode}</td>
                            <td>{item.type}</td>
                            <td>{item.teacher.name}</td>
                            <td>{formatSchedule(item.schedule)}</td>
                            <td><Button variant="outline-dark" onClick={() => { getInfoOfClass(item.classId) }}>Chi tiết</Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <ClassInfoModal show={showModal} handleClose={() => setShowModal(false)} selectedClass={selectedClass} />
        </div>
    );
}
export default StudyPage;
