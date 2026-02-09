import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Table, Spinner, Alert, Button, Form, Row, Col, InputGroup, Pagination, FormLabel } from 'react-bootstrap';
import { Trash3, Pen, InfoCircle, JournalPlus, Search, PersonFillGear } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom';
import ProjectAddModal from '../components/ProjectAddModal';
import './timetable.css';

function ProjectManagePage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [limit1] = useState(1000);
    const [totalPages, setTotalPages] = useState(1);
    const [inputValue, setInputValue] = useState('');
    const [chosenProject, setChosenProject] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState("20251");
    const [teachers, setTeachers] = useState([]);
    const [showAddStudents, setShowAddStudents] = useState(false);
    const navigate = useNavigate();
    const semesters = ['20252', '20251', '20243', '20242', '20241', '20233', '20232', '20231'];

    const fetchProjects = async () => {
        try {
            const res = await adminService.getAllProjects({
                page,
                limit,
                search,
                semester: selectedSemester
            });
            setProjects(res.projects);
            setTotalPages(res.pagination.totalPages);
        } catch (err) {
            setError('Lỗi lấy danh sách lớp học');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTeacher = async () => {
        const data = await adminService.getAllTeacher({ page, limit1, search });
        setTeachers(data.teachers);
    }

    useEffect(() => {
        fetchProjects();
    }, [page, search, selectedSemester]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(inputValue);
            setPage(1);
        }, 500); // delay 500ms

        return () => { clearTimeout(timer); };
    }, [inputValue]);

    const handleCreateProject = async (form) => {
        try {
            const response = await adminService.createProject(form);
            setShowAdd(false);
            const res = await adminService.getAllProjects({ page, limit, search, semester: selectedSemester });
            setProjects(res.projects);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi tạo lớp");
        }
    }

    return (
        <div>
            <h1 className="timetable-title">Quản lý lớp đồ án</h1>
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
                                <JournalPlus size={18} className="me-2" />Thêm lớp đồ án
                            </Button>
                        </Col>
                    </Row>
                </div>

                <Table bordered hover responsive className="timetable-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>MÃ HỌC PHẦN</th>
                            <th>MÔN ĐỒ ÁN</th>
                            <th>MÃ ĐỒ ÁN</th>
                            <th>GIẢNG VIÊN</th>
                            <th>SỐ SINH VIÊN</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>

                    <tbody>
                        {projects.map((prj, index) => (
                            <tr key={prj._id}>
                                <td>{index + 1}</td>
                                <td className="text-center">{prj.subjectCode}</td>
                                <td >{prj.name}</td>
                                <td className="text-center">{prj.classCode}</td>
                                <td>{prj.teacherId.name}</td>
                                <td>{prj.members.length}</td>
                                <td className='text-center'>
                                    <div className="action-icons">
                                        <Button variant='link' className="icon-btn info" ><InfoCircle /></Button>
                                        <Button variant='link' className="icon-btn edit" ><Pen /></Button>
                                        <Button variant='link' className='icon-btn manage' ><PersonFillGear /></Button>
                                        <Button variant='link' className="icon-btn delete" ><Trash3 /></Button>
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

                {projects.length === 0 && (
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

            <ProjectAddModal show={showAdd} onHide={() => setShowAdd(false)} onSave={handleCreateProject} />
        </div>
    );
}

export default ProjectManagePage;
