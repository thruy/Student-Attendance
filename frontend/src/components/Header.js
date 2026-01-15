import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

function Header() {
    const { user } = useAuth();

    return (
        <div className="bg-light">
            <div className="container py-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <h5 className="mb-0 fw-bold">Student Attendance System</h5>
                    <div className="text-muted">  Quản lý điểm danh sinh viên nhanh chóng, hiệu quả</div>
                </div>

                {!user && (
                    <div>
                        <Button as={Link} to="/login" variant="outline-dark">Đăng nhập</Button>
                        <Button as={Link} to="/register" variant="dark" className="ms-4">Đăng ký</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
