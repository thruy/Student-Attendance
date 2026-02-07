import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import ChangePasswordModal from './ChangePassword';
import { Calendar2Check } from 'react-bootstrap-icons';
import './navbar.css';

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
            <Navbar bg="white" expand="lg" className="main-navbar">
                <Container>
                    {/* Logo */}
                    <Navbar.Brand as={Link} to="/student" className="navbar-logo d-flex align-items-center gap-2">
                        <div className="logo-icon"> <Calendar2Check size={20} /></div>
                        <span className="brand-text">S-a-S</span>
                    </Navbar.Brand>

                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav className="nav-links">
                            <Nav.Link as={NavLink} to="/student/study">Học tập</Nav.Link>
                            <Nav.Link as={NavLink} to="/student/project">Đồ án</Nav.Link>
                            <Nav.Link as={NavLink} to="/student/scholarship">Học bổng</Nav.Link>
                            <Nav.Link as={NavLink} to="/student/contact">Hỗ trợ</Nav.Link>

                        </Nav>
                        <Nav>
                            <NavDropdown className='fw-semibold' color='black' title={`Xin chào, ${user?.name || ""} `}>
                                <NavDropdown.Item as={Link} to="/student/profile">Thông tin cá nhân</NavDropdown.Item>
                                {/* <NavDropdown.Item as={Link} to="/student/setting">Cài đặt</NavDropdown.Item> */}
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

export default StudentNavBar;