import { useEffect, useState } from "react";
import authService from "../services/authService";
import { Alert, Card, CardBody, CardHeader, Col, Container, Row, Spinner } from "react-bootstrap";

function UserProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userData = await authService.getUserInfo();
                setUser(userData.user);
            } catch {
                setError("Không thể tải thông tin người dùng!");
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const formatName = (name) => name?.toLowerCase().split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const InfoRow = ({ label, value }) => (
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

    if (loading) {
        return (
            <div>
                <Spinner animation="border" role="status"></Spinner>
                <span>Đang tải thông tin...</span>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="secondary">
                <Alert.Heading>Lỗi khi tải dữ liệu</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )
    }

    return (
        <Card className="container mt-5" style={{ width: "800px" }}>
            <CardHeader as="h4" className="text-center">THÔNG TIN CÁ NHÂN</CardHeader>
            <CardBody className="p-4">
                <Container>
                    <InfoRow label="Họ và tên:" value={formatName(user.name)} />
                    <InfoRow label="Email:" value={user.email} />
                    <InfoRow label="Mã số sinh viên:" value={user.code} />
                    <InfoRow label="Ngày sinh:" value={formatDate(user.dob)} />
                    <InfoRow label="Giới tính:" value={user.gender} />
                    <InfoRow label="Dân tộc:" value={user.ethnic} />
                    <InfoRow label="Đại học:" value={user.university} />
                    <InfoRow label="Khoa/Viện:" value={user.school} />
                    <InfoRow label="Ngành:" value={user.branch} />
                    <InfoRow label="Lớp:" value={user.class} />
                    <InfoRow label="Khóa:" value={user.schoolYear} />
                    <InfoRow label="Hệ đào tạo:" value={user.trainingSystem} />
                    <InfoRow label="Quê quán:" value={user.hometown} />
                    <InfoRow label="Số căn cước công dân:" value={user.identificationNumber} />
                    <InfoRow label="Số điện thoại:" value={user.phone} />
                </Container>
            </CardBody>
        </Card>
    );

}

export default UserProfilePage;