import { useEffect, useState } from "react";
import authService from "../services/authService";
import { Alert, Card, CardBody, CardFooter, CardHeader, Col, Container, Row, Spinner, Button, Modal, Form } from "react-bootstrap";

function UserProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userData = await authService.getUserInfo();
                setUser(userData.user);
                setFormData(userData.user);
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

    const handleUpdate = async (event) => {
        event.preventDefault();
        try {
            const userUpdated = await authService.updateUserInfo(formData);
            setUser(userUpdated.user);
            setShowEdit(false);
        } catch (err) {
            alert("Cập nhật thông tin thất bại");
        }
    }

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
        <>
            <Card className="container mt-5" style={{ width: "800px", marginBottom: "3rem" }}>
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
                        <InfoRow label="Lớp:" value={user.className} />
                        <InfoRow label="Khóa:" value={user.schoolYear} />
                        <InfoRow label="Hệ đào tạo:" value={user.trainingSystem} />
                        <InfoRow label="Quê quán:" value={user.hometown} />
                        <InfoRow label="Số căn cước công dân:" value={user.identificationNumber} />
                        <InfoRow label="Số điện thoại:" value={user.phone} />
                    </Container>
                </CardBody>

                <CardFooter>
                    <Button variant="dark" onClick={() => setShowEdit(true)}>Cập nhật thông tin</Button>
                </CardFooter>
            </Card>

            <Modal show={showEdit} onHide={() => setShowEdit(false)} backdrop="static" keyboard={false} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật thông tin cá nhân</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control value={formatName(user.name)} type="text" autoFocus disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mã số sinh viên</Form.Label>
                            <Form.Control value={user.code} type="text" autoFocus disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Dân tộc</Form.Label>
                            <Form.Control value={formData.ethnic} type="text" autoFocus onChange={(e) => setFormData({ ...formData, ethnic: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Khoa/Viện</Form.Label>
                            <Form.Control value={formData.school} type="text" placeholder="Khoa/Viện/Trường" autoFocus onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngành học</Form.Label>
                            <Form.Control value={formData.branch} type="text" autoFocus onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Lớp</Form.Label>
                            <Form.Control value={formData.className} type="text" autoFocus onChange={(e) => setFormData({ ...formData, class: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Hệ đào tạo</Form.Label>
                            <Form.Select value={formData.trainingSystem} onChange={(e) => setFormData({ ...formData, trainingSystem: e.target.value })}>
                                <option value="Cử nhân">Cử nhân</option>
                                <option value="Kỹ sư">Kỹ sư</option>
                                <option value="Thạc sĩ">Thạc sĩ</option>
                                <option value="Tiến sĩ">Tiến sĩ</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Quê quán</Form.Label>
                            <Form.Control value={formData.hometown} as="textarea" rows={3} onChange={(e) => setFormData({ ...formData, hometown: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số căn cước công dân</Form.Label>
                            <Form.Control value={formData.identificationNumber} type="text" placeholder="040204020402" autoFocus onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control value={formData.phone} type="text" placeholder="0987654321" autoFocus onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-dark" onClick={() => setShowEdit(false)}> Hủy </Button>
                    <Button variant="dark" onClick={handleUpdate}> Cập nhật thay đổi </Button>
                </Modal.Footer>
            </Modal >
        </>
    );
}

export default UserProfilePage;