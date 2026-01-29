import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Table, Spinner, Alert, Button, Form, Row, Col, InputGroup, Pagination } from 'react-bootstrap';
import { Trash3, Pen, InfoCircle, PersonPlus, Search, PersonFillLock } from 'react-bootstrap-icons'
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
            </div>
        </div>
    );
}

export default TeacherManagePage;
