import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";

function Header() {
    const { user } = useAuth();

    return (
        // <div className="bg-light">
        //     <div className="container py-3 d-flex align-items-center justify-content-between">
        //         <div className="d-flex align-items-center">
        //             <h5 className="mb-0 fw-bold">Student Attendance System</h5>
        //             <div className="text-muted">  Quản lý điểm danh sinh viên nhanh chóng, hiệu quả</div>
        //         </div>

        //         {!user && (
        //             <div>
        //                 <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
        //                 <Button as={Link} to="/register" variant="dark" className="ms-4">Đăng ký</Button>
        //             </div>
        //         )}
        //     </div>
        // </div>
        // <div className="bg-dark py-5 text-center header">
        //     <Container>
        //         <h1 className="text-white fw-bold display-5 mb-3">
        //             Student Attendance System
        //         </h1>
        //         <p className="text-light lead">
        //             Quản lý điểm danh sinh viên nhanh chóng, hiệu quả
        //         </p>
        //     </Container>
        // </div>
        <div className="bg-dark py-5 header">
            <Container>
                <Row className="align-items-center text-center text-lg-start">
                    {/* Left content */}
                    <Col lg={8}>
                        <h1 className="text-white fw-bold display-5 mb-3">
                            Student Attendance System
                        </h1>
                        <p className="text-light lead mb-4 mb-lg-0">
                            Quản lý điểm danh sinh viên nhanh chóng, hiệu quả
                        </p>
                    </Col>

                    {/* Right buttons */}
                    <Col lg={4} className="d-flex justify-content-lg-end justify-content-center gap-3" >
                        {!user && (
                            <div className="d-flex align-items-center gap-3 mt-3">
                                <Button as={Link} to='/login' variant="light" size="lg"> Đăng nhập </Button>
                                <Button as={Link} to='/register' variant="outline-light" size="lg"> Đăng ký </Button>
                            </div>
                        )}

                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Header;
