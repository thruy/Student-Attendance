import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import appIcon from '../assets/logo192.png';
//import './NavBar.scss';

const NavBar = () => {
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
                    <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
                    <Button as={Link} to="/register" variant="dark" className="ms-4">Đăng ký</Button>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default NavBar;