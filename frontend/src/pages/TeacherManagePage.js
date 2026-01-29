import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Table, Spinner, Alert, Button, Form, Row, Col, InputGroup, Pagination } from 'react-bootstrap';
import { Trash3, Pen, InfoCircle, PersonPlus, Search, PersonFillLock } from 'react-bootstrap-icons';
import TeacherDetailModal from '../components/TeacherDetailModal';
import TeacherAddModal from '../components/TeacherAddModal';
import TeacherEditModal from '../components/TeacherEditModal';
import './timetable.css';

function TeacherManagePage() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [totalPages, setTotalPages] = useState(1);
    const [inputValue, setInputValue] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        const fetchAllTeacher = async () => {
            setLoading(true);
            try {
                const data = await adminService.getAllTeacher({ page, limit, search });
                console.log('teacher manage page', data.teachers);
                setTeachers(data.teachers);
                setTotalPages(data.pagination.totalPages);
            } catch (err) {
                setError(err.response?.data?.message || 'Lỗi khi lấy danh sách giảng viên');
            } finally {
                setLoading(false);
            }
        }
        fetchAllTeacher();
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

    const handleViewDetail = async (teacherId) => {
        try {
            const data = await adminService.getTeacherDetail(teacherId);
            setSelectedTeacher(data.teacher);
            setShowDetails(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lấy thông tin chi tiết giảng viên');
        }
    };

    const handleCreateTeacher = async (data) => {
        try {
            await adminService.createTeacher(data);
            setShowAdd(false);
            const res = await adminService.getAllTeacher({ page, limit, search });
            setTeachers(res.teachers);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi thêm giảng viên');
        }
    }

    const handleEditTeacher = async (teacher) => {
        const data = await adminService.getTeacherDetail(teacher._id);
        setEditingTeacher(data.teacher);
        setShowEdit(true);
    };

    const handleUpdateTeacher = async (id, data) => {
        try {
            await adminService.updateTeacher(id, data);
            setShowEdit(false);
            const res = await adminService.getAllTeacher({ page, limit, search });
            setTeachers(res.teachers);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin giảng viên');
        }
    }

    const handleResetPassword = async (teacher) => {
        const confirm = window.confirm(
            `Reset mật khẩu cho giảng viên ${teacher.name} - ${teacher.code}?`
        );
        if (!confirm) return;

        try {
            await adminService.resetTeacherPassword(teacher._id);
            alert('Đã reset mật khẩu về 123456');
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi reset mật khẩu');
        }
    };

    return (
        <div>
            <h1 className="timetable-title">Quản lý giảng viên</h1>
            <div>
                <Row className="align-items-center mb-4">
                    {/* Search */}
                    <Col md={6}>
                        <InputGroup className="student-search">
                            <InputGroup.Text><Search /></InputGroup.Text>
                            <Form.Control type="text" placeholder="Tìm kiếm theo tên hoặc mã giảng viên" value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
                        </InputGroup>
                    </Col>
                    {/* Add button */}
                    <Col md={6} className="text-end">
                        <Button className="add-student-btn" onClick={() => setShowAdd(true)}>
                            <PersonPlus size={18} className="me-2" />Thêm giảng viên
                        </Button>
                    </Col>
                </Row>

                <Table bordered hover responsive className="timetable-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>HỌ VÀ TÊN</th>
                            <th>MSGV</th>
                            <th>EMAIL</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>

                    <tbody>
                        {teachers.map((tea, index) => (
                            <tr key={tea._id}>
                                <td>{index + 1}</td>
                                <td>{tea.name}</td>
                                <td className="text-center">{tea.code}</td>
                                <td>{tea.email}</td>
                                <td className='text-center'>
                                    <div className="action-icons">
                                        <Button variant='link' className="icon-btn info" onClick={() => handleViewDetail(tea._id)}><InfoCircle /></Button>
                                        <Button variant='link' className="icon-btn edit" onClick={() => handleEditTeacher(tea)}><Pen /></Button>
                                        <Button variant='link' className="icon-btn reset" onClick={() => handleResetPassword(tea)}><PersonFillLock /></Button>
                                        <Button variant='link' className="icon-btn delete"><Trash3 /></Button>
                                    </div>
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

                {teachers.length === 0 && (
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
            <TeacherDetailModal show={showDetails} onHide={() => setShowDetails(false)} teacher={selectedTeacher} />
            <TeacherEditModal show={showEdit} onHide={() => setShowEdit(false)} student={editingTeacher} onSave={handleUpdateTeacher} />
            <TeacherAddModal show={showAdd} onHide={() => setShowAdd(false)} onSave={handleCreateTeacher} />
        </div>
    );
}

export default TeacherManagePage;
