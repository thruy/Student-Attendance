import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Table, Spinner, Alert, Button, Form, Row, Col, InputGroup, Pagination, FormLabel } from 'react-bootstrap';
import { Trash3, Pen, InfoCircle, JournalPlus, Search, PersonFillGear } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom';
import ClassEditModal from '../components/ClassEditModal';
import ClassAddModal from '../components/ClassAddModal';
import ClassStudentModal from '../components/ClassStudentModal';
import './timetable.css';

function ClassManagePage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [limit1] = useState(1000);
    const [totalPages, setTotalPages] = useState(1);
    const [inputValue, setInputValue] = useState('');
    const [chosenClass, setChosenClass] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState("20251");
    const [teachers, setTeachers] = useState([]);
    const [showAddStudents, setShowAddStudents] = useState(false);
    const navigate = useNavigate();
    const semesters = ['20252', '20251', '20243', '20242', '20241', '20233', '20232', '20231'];

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await adminService.getAllClasses({
                    page,
                    limit,
                    search,
                    semester: selectedSemester
                });
                setClasses(res.classes);
                setTotalPages(res.pagination.totalPages);
            } catch (err) {
                setError('Lỗi lấy danh sách lớp học');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [page, search, selectedSemester]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); // khi search mới → quay về trang 1
        }, 500); // delay 500ms

        return () => {
            clearTimeout(timer);
        };
    }, [inputValue]);

    const fetchAllTeacher = async () => {
        const data = await adminService.getAllTeacher({ page, limit1, search });
        setTeachers(data.teachers);
    }

    useEffect(() => {
        fetchAllTeacher();
    }, []);

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

    const handleCreateClass = async (form) => {
        try {
            const response = await adminService.createClass(form);
            setShowAdd(false);
            const res = await adminService.getAllClasses({ page, limit, search });
            setClasses(res.classes);
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi tạo lớp");
        }
    };

    const handleEditClass = async (cls) => {
        const data = await adminService.getClassDetail(cls._id);
        setChosenClass(data.class);
        setShowEdit(true);
    }

    const handleAddStudentToClass = async (cls) => {
        const data = await adminService.getClassDetail(cls._id);
        setChosenClass(data.class);
        setShowAddStudents(true);
    }

    const handleUpdateClass = async (id, data) => {
        try {
            await adminService.updateClass(id, data);
            setShowEdit(false);
            const res = await adminService.getAllClasses({ page, limit, search });
            setClasses(res.classes);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin sinh viên')
        }
    }

    const handleDeleteClass = async (classId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa lớp học này không?');
        if (!confirmDelete) return;
        try {
            setLoading(true);
            await adminService.deleteClass(classId);
            const res = await adminService.getAllClasses({ page, limit, search });
            setClasses(res.classes);
            alert('Xóa lớp học thành công');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Xóa lớp học thất bại');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="timetable-title">Quản lý lớp học</h1>
            <div>
                <div>
                    <Row className='align-items-center'>
                        <Col md={2}>
                            <FormLabel className='fw-bold ms-1'>Học kỳ</FormLabel>
                        </Col>
                        <Col md={10}></Col>
                    </Row>

                    <Row className="align-items-center mb-4">
                        <Col md={2}>
                            <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="semester-select" >
                                {semesters.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        {/* Search */}
                        <Col md={6}>
                            <InputGroup className="student-search">
                                <InputGroup.Text><Search /></InputGroup.Text>
                                <Form.Control type="text" placeholder="Tìm kiếm" value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} />
                            </InputGroup>
                        </Col>
                        {/* Add button */}
                        <Col md={4} className="text-end">
                            <Button className="add-student-btn" onClick={() => setShowAdd(true)}>
                                <JournalPlus size={18} className="me-2" />Thêm lớp học
                            </Button>
                        </Col>
                    </Row>
                </div>


                <Table bordered hover responsive className="timetable-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>MÃ HỌC PHẦN</th>
                            <th>HỌC PHẦN</th>
                            <th>MÃ LỚP HỌC</th>
                            <th>LOẠI LỚP</th>
                            <th>GIẢNG VIÊN</th>
                            <th>LỊCH HỌC</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>

                    <tbody>
                        {classes.map((cls, index) => (
                            <tr key={cls._id}>
                                <td>{index + 1}</td>
                                <td className="text-center">{cls.subjectCode}</td>
                                <td >{cls.name}</td>
                                <td className="text-center">{cls.classCode}</td>
                                <td className='text-center'>{cls.type}</td>
                                <td>{cls.teacherId.name}</td>
                                <td>{formatSchedule(cls.schedule)}</td>
                                <td className='text-center'>
                                    <div className="action-icons">
                                        <Button variant='link' className="icon-btn info" onClick={() => navigate(`/admin/class/${cls._id}`)}><InfoCircle /></Button>
                                        <Button variant='link' className="icon-btn edit" onClick={() => handleEditClass(cls)}><Pen /></Button>
                                        <Button variant='link' className='icon-btn manage' onClick={() => handleAddStudentToClass(cls)}><PersonFillGear /></Button>
                                        <Button variant='link' className="icon-btn delete" onClick={() => handleDeleteClass(cls._id)}><Trash3 /></Button>
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

                {classes.length === 0 && (
                    <Alert variant="info">
                        <Alert.Heading>Không có lớp học nào!</Alert.Heading>
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

            <ClassEditModal show={showEdit} onHide={() => setShowEdit(false)} classInfo={chosenClass} onSave={handleUpdateClass} teachers={teachers} />
            <ClassAddModal show={showAdd} onHide={() => setShowAdd(false)} onSave={handleCreateClass} teachers={teachers} />
            <ClassStudentModal show={showAddStudents} onHide={() => setShowAddStudents(false)} classInfo={chosenClass} />
        </div>
    );
}

export default ClassManagePage;
