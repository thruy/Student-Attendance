import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import appIcon from '../assets/logo192.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import ChangePasswordModal from './ChangePassword';

const StudentNavBar = (props) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to='/student' className="d-flex align-items-center fs-4 fw-semibold">
                        <img src={appIcon} alt="App Icon" width="32" height="32" className=" me-2" />
                        S-a-S
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <NavLink to="/student/study" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Học tập</NavLink>
                        <NavLink to="/student/project" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Đồ án</NavLink>
                        <NavLink to="/student/scholarship" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Học bổng</NavLink>
                        <NavLink to="/student/contact" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Liên hệ</NavLink>
                        <NavLink to="/student/support" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Hỗ trợ</NavLink>
                    </Nav>
                    <Nav>
                        {user && (
                            <NavDropdown title={`Xin chào, ${user?.name || ""}`} id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/student/profile">Thông tin cá nhân</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/student/setting">Cài đặt</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                            </NavDropdown>
                        )}

                    </Nav>
                </Container>
            </Navbar>

            <ChangePasswordModal show={showChangePassword} handleClose={() => setShowChangePassword(false)} />
        </>

    )
}

export default StudentNavBar;