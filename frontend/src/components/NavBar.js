import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import ChangePasswordModal from './ChangePassword';
import { Calendar2Check } from 'react-bootstrap-icons';
import './navbar.css';

// đường dẫn tương đối so với /<role>
const NAV_LINKS = {
    admin: [
        { to: 'student', label: 'Sinh viên' },
        { to: 'teacher', label: 'Giảng viên' },
        { to: 'class', label: 'Lớp học' },
        { to: 'project', label: 'Đồ án' },
        { to: 'scholarship', label: 'Học bổng' }
    ],
    teacher: [
        { to: 'teaching', label: 'Giảng dạy' },
        { to: 'invigilation', label: 'Coi thi' },
        { to: 'project', label: 'Đồ án' },
        { to: 'contact', label: 'Liên hệ' },
        { to: 'support', label: 'Hỗ trợ' }
    ],
    student: [
        { to: 'study', label: 'Học tập' },
        { to: 'exam', label: 'Lịch thi' },
        { to: 'project', label: 'Đồ án' },
        { to: 'scholarship', label: 'Học bổng' },
        { to: 'contact', label: 'Hỗ trợ' }
    ]
};

const NavBar = () => {
    const { logout, user, role } = useAuth();
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const basePath = `/${role}`;

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <>
            <Navbar bg="white" expand="lg" className="main-navbar">
                <Container>
                    {/* Logo */}
                    <Navbar.Brand as={Link} to={basePath} className="navbar-logo d-flex align-items-center gap-2">
                        <div className="logo-icon"> <Calendar2Check size={20} /></div>
                        <span className="brand-text">S-a-S</span>
                    </Navbar.Brand>

                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav className="nav-links">
                            {(NAV_LINKS[role] || []).map(link => (
                                <Nav.Link key={link.to} as={NavLink} to={`${basePath}/${link.to}`}>{link.label}</Nav.Link>
                            ))}
                        </Nav>
                        <Nav>
                            <NavDropdown className='fw-semibold' color='black' title={`Xin chào, ${user?.name || ""} `}>
                                <NavDropdown.Item as={Link} to={`${basePath}/profile`}>Thông tin cá nhân</NavDropdown.Item>
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

export default NavBar;
