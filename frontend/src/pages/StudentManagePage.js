import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Table, Spinner, Alert, Button, Form, Row, Col, InputGroup, Pagination } from 'react-bootstrap';
import { Trash3, Pen, InfoCircle, PersonPlus, Search, PersonFillLock } from 'react-bootstrap-icons'
import './timetable.css';
import StudentDetailModal from '../components/StudentDetailModal';

function StudentManagePage() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [inputValue, setInputValue] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        const fetchAllStudent = async () => {
            setLoading(true);
            try {
                const data = await adminService.getAllStudent({ page, limit, search });
                console.log('student', data.students);
                setStudents(data.students);
                setTotalPages(data.pagination.totalPages);
            } catch (err) {
                setError(err.response?.data?.message || 'Lỗi khi lấy danh sách sinh viên');
            } finally {
                setLoading(false);
            }
        }
        fetchAllStudent();
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); // khi search mới → quay về trang 1
        }, 500); // delay 500ms

        return () => {
            clearTimeout(timer);
        };
    }, [inputValue]);

    const handleViewDetail = async (studentId) => {
        try {
            const data = await adminService.getStudentDetail(studentId);
            setSelectedStudent(data.student);
            setShowDetails(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lấy thông tin chi tiết sinh viên');
        }
    };

    const handleCreateStudent = async (data) => {
        try {
            await adminService.createStudent(data);
            setShowAdd(false);
            const res = await adminService.getAllStudent({ page, limit, search });
            setStudents(res.students);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi thêm sinh viên');
        }
    }

    const handleEditStudent = async (student) => {
        const data = await adminService.getStudentDetail(student._id);
        setEditingStudent(data.student);
        setShowEdit(true);
    };

    const handleUpdateStudent = async (id, data) => {
        try {
            await adminService.updateStudent(id, data);
            setShowEdit(false);
            const res = await adminService.getAllStudent({ page, limit, search });
            setStudents(res.students);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin sinh viên')
        }
    }

    const handleResetPassword = async (student) => {
        const confirm = window.confirm(
            `Reset mật khẩu cho sinh viên ${student.name} - ${student.code}?`
        );
        if (!confirm) return;

        try {
            await adminService.resetStudentPassword(student._id);
            alert('Đã reset mật khẩu về 123456');
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi reset mật khẩu');
        }
    };

    return (
        <div>
            <h1 className="timetable-title">Quản lý sinh viên</h1>
            <div>
                <Row className="align-items-center mb-4">
                    {/* Search */}
                    <Col md={6}>
                        <InputGroup className="student-search">
                            <InputGroup.Text><Search /></InputGroup.Text>
                            <Form.Control type="text" placeholder="Tìm kiếm theo tên hoặc MSSV" value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
                        </InputGroup>
                    </Col>
                    {/* Add button */}
                    <Col md={6} className="text-end">
                        <Button className="add-student-btn" onClick={() => setShowAdd(true)}>
                            <PersonPlus size={18} className="me-2" />Thêm sinh viên
                        </Button>
                    </Col>
                </Row>

                {loading && (
                    <div>
                        <Spinner animation="border" role="status"></Spinner>
                        <span>Đang tải thông tin...</span>
                    </div>
                )}

                {students.length === 0 && (
                    <Alert variant="info">
                        <Alert.Heading>Không có sinh viên nào!</Alert.Heading>
                    </Alert>
                )}

                {error && (
                    <Alert variant="danger">
                        <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}

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
                                <td className='text-center'>
                                    <div className="action-icons">
                                        <Button variant='link' className="icon-btn info" onClick={() => handleViewDetail(std._id)}><InfoCircle /></Button>
                                        <Button variant='link' className="icon-btn edit" onClick={() => handleEditStudent(std)}><Pen /></Button>
                                        <Button variant='link' className="icon-btn reset" onClick={() => handleResetPassword(std)}><PersonFillLock /></Button>
                                        <Button variant='link' className="icon-btn delete"><Trash3 /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {/* <p>Tổng số sinh viên: {total}</p> */}

                <Pagination>
                    <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />

                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item key={index + 1} active={index + 1 === page} onClick={() => setPage(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
                </Pagination>
            </div>
            <StudentDetailModal show={showDetails} onHide={() => setShowDetails(false)} student={selectedStudent} />
            <EditStudentModal show={showEdit} onHide={() => setShowEdit(false)} student={editingStudent} onSave={handleUpdateStudent} />
            <AddStudentModal show={showAdd} onHide={() => setShowAdd(false)} onSave={handleCreateStudent} />
        </div>
    );
}

export default StudentManagePage;
