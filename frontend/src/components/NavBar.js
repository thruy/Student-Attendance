import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import appIcon from '../assets/logo192.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
//import './NavBar.scss';

const NavBar = (props) => {
    const { isAuthenticated, logout, user } = useAuth()
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand to='/' className="d-flex align-items-center fs-4 fw-semibold">
                    <img src={appIcon} alt="App Icon" width="32" height="32" className=" me-2" />
                    S-a-S
                </Navbar.Brand>
                <Nav className="me-auto">
                    <NavLink to="/main" className="me-4 fs-5 nav-link" >Trang chủ</NavLink>
                    <NavLink to="/study" className="me-4 fs-5 nav-link">Học tập</NavLink>
                    <NavLink to="/project" className="me-4 fs-5 nav-link">Đồ án</NavLink>
                    <NavLink to="/scholarship" className="me-4 fs-5 nav-link">Học bổng</NavLink>
                    <NavLink to="/contact" className="me-4 fs-5 nav-link">Liên hệ</NavLink>
                    <NavLink to="/support" className="me-4 fs-5 nav-link">Hỗ trợ</NavLink>
                </Nav>
                <Nav>
                    {isAuthenticated ? (
                        <NavDropdown title={`Xin chào, ${user?.name || ""}`} id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Thông tin cá nhân</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Cài đặt</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Đổi mật khẩu</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <>
                            <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
                            <Button as={Link} to="/register" variant="dark" className="ms-4">Đăng ký</Button>
                        </>
                    )}

                </Nav>
            </Container>
        </Navbar>
    )
}

export default NavBar;