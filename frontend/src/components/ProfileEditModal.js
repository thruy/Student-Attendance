import { useEffect, useState } from "react";
import { Form, Modal, Button } from "react-bootstrap";
import { getProfileLabels } from '../utils/profileLabels';

// role: 'student' | 'teacher'
function ProfileEditModal({ show, onHide, role, profile, onSave }) {
    const labels = getProfileLabels(role);
    const isStudent = role === 'student';
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
        if (profile) {
            setFormData({
                ...profile,
                dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''
            });
        }
    }, [profile]);

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa thông tin {labels.title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control value={formData.name} type="text" autoFocus onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{labels.code}</Form.Label>
                        <Form.Control value={formData.code} type="text" onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={formData.email} type="text" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Ngày sinh</Form.Label>
                        <Form.Control value={formData.dob} type="date" onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
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
                        <Form.Control value={formData.ethnic} type="text" onChange={(e) => setFormData({ ...formData, ethnic: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{labels.school}</Form.Label>
                        <Form.Control value={formData.school} type="text" placeholder="Khoa/Viện/Trường" onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{labels.branch}</Form.Label>
                        <Form.Control value={formData.branch} type="text" onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                    </Form.Group>
                    {isStudent && (
                        <Form.Group className="mb-3">
                            <Form.Label>Lớp</Form.Label>
                            <Form.Control value={formData.className} type="text" onChange={(e) => setFormData({ ...formData, className: e.target.value })} />
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>{labels.trainingSystem}</Form.Label>
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
                        <Form.Control value={formData.identificationNumber} type="text" placeholder="040204020402" onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control value={formData.phone} type="text" placeholder="0987654321" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onClick={() => onSave(profile._id, formData)}> Cập nhật thay đổi </Button>
            </Modal.Footer>
        </Modal >
    )
}

export default ProfileEditModal;
