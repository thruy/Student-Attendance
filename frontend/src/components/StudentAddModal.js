import { Modal, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

function StudentAddModal({ show, onHide, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        email: '',
        gender: '',
        dob: ''
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = () => {
        if (!validate()) return;
        onSave(formData);
        setFormData(initialState);
    };

    return (
        <Modal show={show} onHide={onHide} >
            <Modal.Header closeButton>
                <Modal.Title>Thêm sinh viên mới</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control value={formData.name} type="text" autoFocus onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã số sinh viên</Form.Label>
                        <Form.Control value={formData.code} type="text" autoFocus onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={formData.email} type="text" autoFocus onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control value={formData.dob} type="date" autoFocus onChange={(e) => setFormData({ ...formData, dob: e.target.value })} required />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onSave={handleSubmit}> Cập nhật thay đổi </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default StudentAddModal;