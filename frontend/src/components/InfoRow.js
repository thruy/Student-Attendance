import { Row, Col } from 'react-bootstrap';
import '../pages/timetable.css';

// một dòng "nhãn - giá trị" trong các trang/modal thông tin chi tiết
function InfoRow({ label, value }) {
    return (
        <Row className="mb-3 align-items-center">
            <Col md={4} className="fw-bold">
                {label}
            </Col>
            <Col md={8}>
                <div className="info-value">
                    {value || <span className="text-muted">Chưa cập nhật</span>}
                </div>
            </Col>
        </Row>
    );
}

export default InfoRow;
