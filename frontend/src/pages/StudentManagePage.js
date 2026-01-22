import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import { Trash3, Pen } from 'react-bootstrap-icons'
import './timetable.css';

function StudentManagePage() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchAllStudent = async () => {
            try {
                const data = await adminService.getAllStudent();
                console.log(data.students);
                setStudents(data.students);
            } catch (err) {
                setError('Lỗi khi lấy danh sách sinh viên', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAllStudent();
    }, []);

    if (loading) {
        return (
            <div>
                <Spinner animation="border" role="status"></Spinner>
                <span>Đang tải thông tin...</span>
            </div>
        )
    }

    if (students.length === 0) {
        return <Alert variant="info">
            <Alert.Heading>Chưa có sinh viên nào!</Alert.Heading>
        </Alert>;
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )
    }

    return (
        <div>
            <h1 className="timetable-title">Quản lý sinh viên</h1>

            <Table bordered hover responsive className="timetable-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>HỌ VÀ TÊN</th>
                        <th>MSSV</th>
                        <th>EMAIL</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>

                <tbody>
                    {students.map((std, index) => (
                        <tr key={std._id}>
                            <td>{index + 1}</td>
                            <td>{std.name}</td>
                            <td className="text-center">{std.code}</td>
                            <td>{std.email}</td>
                            <td>
                                <Button variant='light'><Pen /></Button>
                                <Button><Trash3 /></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default StudentManagePage;
