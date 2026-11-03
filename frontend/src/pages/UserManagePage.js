import { useCallback, useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Table, Spinner, Alert, Button, Form, Row, Col, InputGroup, Pagination } from 'react-bootstrap';
import { Trash3, Pen, InfoCircle, PersonPlus, Search, PersonFillLock } from 'react-bootstrap-icons';
import './timetable.css';
import ProfileModal from '../components/ProfileModal';
import ProfileAddModal from '../components/ProfileAddModal';
import ProfileEditModal from '../components/ProfileEditModal';
import { getProfileLabels } from '../utils/profileLabels';

// khác biệt giữa trang quản lý sinh viên và giảng viên
const CONFIG = {
    student: {
        getAll: adminService.getAllStudent,
        getDetail: adminService.getStudentDetail,
        create: adminService.createStudent,
        update: adminService.updateStudent,
        resetPassword: adminService.resetStudentPassword,
        listKey: 'students',
        detailKey: 'student',
        codeHeader: 'MSSV',
        searchPlaceholder: 'Tìm kiếm theo tên hoặc MSSV'
    },
    teacher: {
        getAll: adminService.getAllTeacher,
        getDetail: adminService.getTeacherDetail,
        create: adminService.createTeacher,
        update: adminService.updateTeacher,
        resetPassword: adminService.resetTeacherPassword,
        listKey: 'teachers',
        detailKey: 'teacher',
        codeHeader: 'MSGV',
        searchPlaceholder: 'Tìm kiếm theo tên hoặc mã giảng viên'
    }
};

// role: 'student' | 'teacher'
function UserManagePage({ role }) {
    const config = CONFIG[role];
    const { title } = getProfileLabels(role);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [totalPages, setTotalPages] = useState(1);
    const [inputValue, setInputValue] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const fetchUsers = useCallback(async () => {
        const data = await config.getAll({ page, limit, search });
        setUsers(data[config.listKey]);
        setTotalPages(data.pagination.totalPages);
    }, [config, page, limit, search]);

    useEffect(() => {
        setLoading(true);
        fetchUsers()
            .catch(err => setError(err.response?.data?.message || `Lỗi khi lấy danh sách ${title}`))
            .finally(() => setLoading(false));
    }, [fetchUsers, title]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); // khi search mới → quay về trang 1
        }, 500); // delay 500ms

        return () => {
            clearTimeout(timer);
        };
    }, [inputValue]);

    const handleViewDetail = async (userId) => {
        try {
            const data = await config.getDetail(userId);
            setSelectedUser(data[config.detailKey]);
            setShowDetails(true);
        } catch (err) {
            setError(err.response?.data?.message || `Lỗi khi lấy thông tin chi tiết ${title}`);
        }
    };

    const handleCreate = async (data) => {
        try {
            await config.create(data);
            setShowAdd(false);
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || `Lỗi thêm ${title}`);
        }
    }

    const handleEdit = async (user) => {
        const data = await config.getDetail(user._id);
        setEditingUser(data[config.detailKey]);
        setShowEdit(true);
    };

    const handleUpdate = async (id, data) => {
        try {
            await config.update(id, data);
            setShowEdit(false);
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || `Lỗi khi cập nhật thông tin ${title}`);
        }
    }

    const handleResetPassword = async (user) => {
        const confirm = window.confirm(
            `Reset mật khẩu cho ${title} ${user.name} - ${user.code}?`
        );
        if (!confirm) return;

        try {
            await config.resetPassword(user._id);
            alert('Đã reset mật khẩu về 123456');
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi reset mật khẩu');
        }
    };

    return (
        <div>
            <h1 className="timetable-title">Quản lý {title}</h1>
            <div>
                <Row className="align-items-center mb-4">
                    {/* Search */}
                    <Col md={6}>
                        <InputGroup className="student-search">
                            <InputGroup.Text><Search /></InputGroup.Text>
                            <Form.Control type="text" placeholder={config.searchPlaceholder} value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
                        </InputGroup>
                    </Col>
                    {/* Add button */}
                    <Col md={6} className="text-end">
                        <Button className="add-student-btn" onClick={() => setShowAdd(true)}>
                            <PersonPlus size={18} className="me-2" />Thêm {title}
                        </Button>
                    </Col>
                </Row>

                <Table bordered hover responsive className="timetable-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>HỌ VÀ TÊN</th>
                            <th>{config.codeHeader}</th>
                            <th>EMAIL</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td className="text-center">{user.code}</td>
                                <td>{user.email}</td>
                                <td className='text-center'>
                                    <div className="action-icons">
                                        <Button variant='link' className="icon-btn info" onClick={() => handleViewDetail(user._id)}><InfoCircle /></Button>
                                        <Button variant='link' className="icon-btn edit" onClick={() => handleEdit(user)}><Pen /></Button>
                                        <Button variant='link' className="icon-btn reset" onClick={() => handleResetPassword(user)}><PersonFillLock /></Button>
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

                {!loading && users.length === 0 && (
                    <Alert variant="info">
                        <Alert.Heading>Không có {title} nào!</Alert.Heading>
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
            <ProfileModal show={showDetails} onHide={() => setShowDetails(false)} role={role} profile={selectedUser} />
            <ProfileEditModal show={showEdit} onHide={() => setShowEdit(false)} role={role} profile={editingUser} onSave={handleUpdate} />
            <ProfileAddModal show={showAdd} onHide={() => setShowAdd(false)} role={role} onSave={handleCreate} />
        </div>
    );
}

export default UserManagePage;
