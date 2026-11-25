import { Modal, Container } from 'react-bootstrap';
import '../pages/timetable.css';
import ProfileInfo from './ProfileInfo';
import { getProfileLabels } from '../utils/profileLabels';

// role: 'student' | 'teacher'; children: phần bổ sung dưới thông tin (vd ảnh khuôn mặt của sinh viên)
function ProfileModal({ show, onHide, role, profile, children }) {
    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className='text-center'>Thông tin chi tiết {getProfileLabels(role).title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <ProfileInfo role={role} profile={profile} />
                    {children}
                </Container>
            </Modal.Body>
        </Modal>
    )
}

export default ProfileModal;
