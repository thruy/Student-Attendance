import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Calendar2Check, CheckCircle, FileText, Calendar3 } from "react-bootstrap-icons";
import './Intro.css'
import { Link } from "react-router-dom";

function Intro() {
    const FEATURES = [{
        icon: <CheckCircle size={28} />,
        title: "Điểm danh nhanh chóng",
        desc: "Chỉ cần vài giây để hoàn thành điểm danh cho cả lớp học",
    }, {
        icon: <Calendar3 size={28} />,
        title: "Theo dõi thời gian thực",
        desc: "Cập nhật và xem dữ liệu điểm danh ngay lập tức",
    }, {
        icon: <FileText size={28} />,
        title: "Báo cáo chi tiết",
        desc: "Phân tích và thống kê đầy đủ về tình hình điểm danh",
    },]
    return (
        <div>
            <div className="landing-wrapper">
                <Container className="landing-content text-center">
                    {/* Logo */}
                    <div className="logo-wrapper mx-auto mb-4"><Calendar2Check size={36} /></div>

                    {/* Title */}
                    <h1 className="landing-title">S-a-S</h1>
                    <h2 className="landing-subtitle">Student Attendance System</h2>

                    {/* Description */}
                    <p className="landing-description">
                        Hệ thống điểm danh sinh viên thông minh, hiện đại và dễ sử dụng.
                        <br />
                        Quản lý hiệu quả, theo dõi chính xác, tiết kiệm thời gian.
                    </p>

                    {/* Buttons */}
                    <div className="landing-actions d-flex justify-content-center gap-3">
                        <Button as={Link} to='/login' className="btn-login" variant="dark">Đăng nhập</Button>
                        <Button as={Link} to='/register' variant="outline-dark" className="btn-register">Đăng ký ngay</Button>
                    </div>
                </Container>
            </div>

            <section className="features-wrapper">
                <Container>
                    {/* Title */}
                    <h2 className="features-title text-center mb-5">Tính năng nổi bật</h2>

                    {/* Cards */}
                    <Row className="g-4 justify-content-center">
                        {FEATURES.map((f, index) => (
                            <Col md={4} key={index}>
                                <Card className="feature-card h-100">
                                    <Card.Body className="text-center">
                                        <div className="feature-icon-wrapper mx-auto mb-4">{f.icon}</div>
                                        <h5 className="feature-title">{f.title}</h5>
                                        <p className="feature-desc">{f.desc}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default Intro;
