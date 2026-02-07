import { Modal, Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

const semesters = ['20251', '20243', '20242', '20241', '20233', '20232', '20231'];

function ProjectAddModal({ show, onHide, onSave }) {
    const [allTeachers, setAllTeachers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        subjectCode: '',
        projectCode: '',
        semester: '',
        teacherId: '',
    });

    const fetchTeachers = async () => {
        const res = await adminService.getTeachersForProjectModal('');
        setAllTeachers(res.teachers);
    };

    useEffect(() => {
        fetchTeachers();
    }, [show])

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size='large'>
            <Modal.Header closeButton>
                <Modal.Title>Thêm lớp đồ án mới</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã đồ án</Form.Label>
                        <Form.Control value={formData.subjectCode} type="text" autoFocus onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên học phần đồ án</Form.Label>
                        <Form.Control value={formData.name} type="text" autoFocus onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã lớp đồ án</Form.Label>
                        <Form.Control value={formData.classCode} type="text" autoFocus onChange={(e) => setFormData({ ...formData, classCode: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Học kỳ</Form.Label>
                        <Form.Select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })}>
                            <option value=''>Chọn học kỳ</option>
                            {semesters.map((item) => (
                                <option value={item}>{item}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giảng viên</Form.Label>
                        <Form.Select value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}>
                            <option value=''>Chọn giảng viên</option>
                            {allTeachers.map((t) => (
                                <option key={t._id} value={t._id}>{t.name} - {t.code}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onClick={onSave(formData)}> Thêm lớp đồ án </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ProjectAddModal;