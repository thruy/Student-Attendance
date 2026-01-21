import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import ChangePasswordModal from './ChangePassword';
import { Calendar2Check } from 'react-bootstrap-icons';
import './navbar.css';

const TeacherNavBar = (props) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <>
            {/* <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to='/teacher' className="d-flex align-items-center fs-4 fw-semibold">
                        <img src={appIcon} alt="App Icon" width="32" height="32" className=" me-2" />
                        S-a-S
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <NavLink to="/teacher/teaching" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Giảng dạy</NavLink>
                        <NavLink to="/teacher/project" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Đồ án</NavLink>
                        <NavLink to="/teacher/contact" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Liên hệ</NavLink>
                        <NavLink to="/teacher/support" className={({ isActive }) => `me-4 fs-5 nav-link ${isActive ? "active fw-semibold" : ""}`}>Hỗ trợ</NavLink>
                    </Nav>
                    <Nav>
                        {user && (
                            <NavDropdown title={`Xin chào, ${user?.name || ""}`} id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/teacher/profile">Thông tin cá nhân</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/teacher/setting">Cài đặt</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                            </NavDropdown>
                        )}

                    </Nav>
                </Container>
            </Navbar> */}

            <Navbar bg="white" expand="lg" className="main-navbar">
                <Container>
                    {/* Logo */}
                    <Navbar.Brand as={Link} to="/teacher" className="navbar-logo d-flex align-items-center gap-2">
                        <div className="logo-icon"> <Calendar2Check size={20} /></div>
                        <span className="brand-text">S-a-S</span>
                    </Navbar.Brand>

                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav className="nav-links">
                            <Nav.Link as={NavLink} to="/teacher/teaching">Giảng dạy</Nav.Link>
                            <Nav.Link as={NavLink} to="/teacher/project">Đồ án</Nav.Link>
                            <Nav.Link as={NavLink} to="/teacher/contact">Liên hệ</Nav.Link>
                            <Nav.Link as={NavLink} to="/teacher/support">Hỗ trợ</Nav.Link>

                        </Nav>
                        <Nav>
                            <NavDropdown className='fw-semibold' color='black' title={`Xin chào, ${user?.name || ""} `}>
                                <NavDropdown.Item as={Link} to="/teacher/profile">Thông tin cá nhân</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/teacher/setting">Cài đặt</NavDropdown.Item>
                                <NavDropdown.Item onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <ChangePasswordModal show={showChangePassword} handleClose={() => setShowChangePassword(false)} />
        </>
    )
}

export default TeacherNavBar;