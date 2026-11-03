import { Modal, Button, Form } from 'react-bootstrap';
import { getProfileLabels } from '../utils/profileLabels';
import { useState } from 'react';

// role: 'student' | 'teacher'
function ProfileAddModal({ show, onHide, role, onSave }) {
    const labels = getProfileLabels(role);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        email: '',
        gender: '',
        dob: ''
    });

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered >
            <Modal.Header closeButton>
                <Modal.Title>Thêm {labels.title} mới</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control value={formData.name} type="text" autoFocus onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{labels.code}</Form.Label>
                        <Form.Control value={formData.code} type="text" onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={formData.email} type="text" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required>
                            <option value="">-- Chọn giới tính --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control value={formData.dob} type="date" onChange={(e) => setFormData({ ...formData, dob: e.target.value })} required />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onClick={() => onSave(formData)}> Thêm {labels.title} </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ProfileAddModal;
