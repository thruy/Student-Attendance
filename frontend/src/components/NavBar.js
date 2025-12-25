import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import appIcon from '../assets/logo192.png';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
//import './NavBar.scss';

const NavBar = (props) => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext)
    const navigate = useNavigate()



    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand to='/' className="d-flex align-items-center fs-4 fw-semibold">
                    <img src={appIcon} alt="App Icon" width="32" height="32" className=" me-2" />
                    S-a-S
                </Navbar.Brand>
                <Nav className="me-auto">
                    <NavLink to="/" className="me-4 fs-5 nav-link" >Trang chủ</NavLink>
                    <Nav.Link to="/study" className="me-4 fs-5 nav-link">Học tập</Nav.Link>
                    <Nav.Link to="/project" className="me-4 fs-5 nav-link">Đồ án</Nav.Link>
                    <Nav.Link to="/scholarship" className="me-4 fs-5 nav-link">Học bổng</Nav.Link>
                    <Nav.Link to="/contact" className="me-4 fs-5 nav-link">Liên hệ</Nav.Link>
                    <Nav.Link to="/support" className="me-4 fs-5 nav-link">Hỗ trợ</Nav.Link>
                </Nav>
                <Nav>
                    {!isAuthenticated && (
                        <>
                            <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
                            <Button as={Link} to="/register" variant="dark" className="ms-4">Đăng ký</Button>
                        </>
                    )}
                    {isAuthenticated && (
                        <NavDropdown title="Xin chào " id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Thông tin cá nhân</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Cài đặt</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Đổi mật khẩu</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Đăng xuất</NavDropdown.Item>
                        </NavDropdown>
                    )}

                </Nav>
            </Container>
        </Navbar>
    )
}

export default NavBar;