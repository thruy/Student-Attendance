import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import ChangePasswordModal from './ChangePassword';
import { Calendar2Check } from 'react-bootstrap-icons';
import './navbar.css';

const AdminNavBar = () => {
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
                    <Navbar.Brand as={Link} to='/admin' className="d-flex align-items-center fs-4 fw-semibold">
                        <img src={appIcon} alt="App Icon" width="32" height="32" className=" me-2" />
                        S-a-S
                    </Navbar.Brand>

                    <Nav className='me-auto'>
                        <NavLink>Sinh viên</NavLink>
                        <NavLink>Giảng viên</NavLink>
                        <NavLink>Lớp học</NavLink>
                        <NavLink>Đồ án</NavLink>
                        <NavLink>Học bổng</NavLink>
                    </Nav>

                    <Nav>
                        {user && (
                            <NavDropdown title={`Xin chào, ${user?.name || ""}`} id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/admin/profile">Thông tin cá nhân</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/setting">Cài đặt</NavDropdown.Item>
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
                    <Navbar.Brand as={Link} to="/admin" className="navbar-logo d-flex align-items-center gap-2">
                        <div className="logo-icon"> <Calendar2Check size={20} /></div>
                        <span className="brand-text">S-a-S</span>
                    </Navbar.Brand>

                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav className="nav-links">
                            <Nav.Link as={NavLink} to="/admin/student">Sinh viên</Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/teacher">Giảng viên</Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/class">Lớp học</Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/project">Đồ án</Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/scholarship">Học bổng</Nav.Link>

                        </Nav>
                        <Nav>
                            <NavDropdown className='fw-semibold' color='black' title={`Xin chào, ${user?.name || ""} `}>
                                <NavDropdown.Item as={Link} to="/admin/profile">Thông tin cá nhân</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/admin/setting">Cài đặt</NavDropdown.Item>
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

export default AdminNavBar;