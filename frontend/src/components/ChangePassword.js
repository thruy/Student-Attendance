import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import authService from "../services/authService";

function ChangePasswordModal({ show, handleClose }) {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (form.oldPassword.trim() === '' || form.newPassword.trim() === '' || form.confirmPassword.trim() === '') {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (form.newPassword.length < 6) {
            setError('Mật khẩu mới cần có ít nhất 6 kí tự');
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await authService.changePassword(form);
            setSuccess('Đổi mật khẩu thành công');
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={() => { handleClose(); setError(''); }} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Đổi mật khẩu</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu cũ</Form.Label>
                        <Form.Control type="password" name="oldPassword" onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu mới</Form.Label>
                        <Form.Control type="password" name="newPassword" onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
                        <Form.Text muted>Mật khẩu mới có chứa ít nhất 6 kí tự</Form.Text>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                        <Form.Control type="password" name="confirmPassword" onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                        <Form.Text muted>Xác nhận lại mật khẩu mới đã nhập</Form.Text>
                    </Form.Group>
                </Form>
                <br />
                {error && <p className="text-danger">{error}</p>}
                {success && <p className="text-success">{success}</p>}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={() => { handleClose(); setError(''); }}>Hủy</Button>
                <Button variant="success" onClick={handleSubmit} disabled={loading}> {loading ? 'Đang lưu...' : 'Lưu'}</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ChangePasswordModal;
