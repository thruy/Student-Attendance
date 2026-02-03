import { useEffect, useState } from "react";
import { Form, Modal, Button } from "react-bootstrap";

function TeacherEditModal({ show, onHide, teacher, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        email: '',
        dob: '',
        gender: '',
        ethnic: '',
        school: '',
        branch: '',
        className: '',
        trainingSystem: '',
        hometown: '',
        identificationNumber: '',
        phone: ''
    });

    useEffect(() => {
        if (teacher) {
            setFormData({
                ...teacher,
                dob: teacher.dob ? new Date(teacher.dob).toISOString().split('T')[0] : ''
            });
        }
    }, [teacher]);

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa thông tin giảng viên</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control value={formData.name} type="text" autoFocus onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã số giảng viên</Form.Label>
                        <Form.Control value={formData.code} type="text" autoFocus onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={formData.email} type="text" autoFocus onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control value={formData.dob} type="date" autoFocus onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Dân tộc</Form.Label>
                        <Form.Control value={formData.ethnic} type="text" autoFocus onChange={(e) => setFormData({ ...formData, ethnic: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Viện/Trường</Form.Label>
                        <Form.Control value={formData.school} type="text" placeholder="Khoa/Viện/Trường" autoFocus onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Khoa</Form.Label>
                        <Form.Control value={formData.branch} type="text" autoFocus onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Học vị</Form.Label>
                        <Form.Select value={formData.trainingSystem} onChange={(e) => setFormData({ ...formData, trainingSystem: e.target.value })}>
                            <option value="Cử nhân">Cử nhân</option>
                            <option value="Kỹ sư">Kỹ sư</option>
                            <option value="Thạc sĩ">Thạc sĩ</option>
                            <option value="Tiến sĩ">Tiến sĩ</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Quê quán</Form.Label>
                        <Form.Control value={formData.hometown} as="textarea" rows={3} onChange={(e) => setFormData({ ...formData, hometown: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Số căn cước công dân</Form.Label>
                        <Form.Control value={formData.identificationNumber} type="text" placeholder="040204020402" autoFocus onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control value={formData.phone} type="text" placeholder="0987654321" autoFocus onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onClick={() => onSave(teacher._id, formData)}> Cập nhật thay đổi </Button>
            </Modal.Footer>
        </Modal >
    )
}

export default TeacherEditModal;