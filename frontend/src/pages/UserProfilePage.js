import { useEffect, useState } from "react";
import authService from "../services/authService";
import { Alert, Card, CardBody, CardFooter, CardHeader, Container, Spinner, Button, Modal, Form } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import ProfileInfo, { formatName } from '../components/ProfileInfo';
import { getProfileLabels } from '../utils/profileLabels';
import FacePhotoCard from '../components/FacePhotoCard';

function UserProfilePage() {
    const { role } = useAuth();
    const labels = getProfileLabels(role);
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

    return (
        <>
            <Card className="container mt-5" style={{ width: "800px", marginBottom: "3rem" }}>
                <CardHeader as="h4" className="text-center">THÔNG TIN CÁ NHÂN</CardHeader>
                <CardBody className="p-4">
                    {loading && (
                        <div>
                            <Spinner animation="border" role="status"></Spinner>
                            <span>Đang tải thông tin...</span>
                        </div>
                    )}

                    {error && (
                        <Alert variant="secondary">
                            <Alert.Heading>Lỗi khi tải dữ liệu</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <Container>
                        <ProfileInfo role={role} profile={user} />
                    </Container>
                </CardBody>

                <CardFooter>
                    <Button variant="dark" onClick={() => setShowEdit(true)}>Chỉnh sửa thông tin</Button>
                </CardFooter>
            </Card>

            {role === 'student' && <FacePhotoCard />}

            <Modal show={showEdit} onHide={() => setShowEdit(false)} backdrop="static" keyboard={false} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa thông tin cá nhân</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control value={formatName(user?.name)} type="text" autoFocus disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{labels.code}</Form.Label>
                            <Form.Control value={user?.code} type="text" autoFocus disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select value={formData?.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Dân tộc</Form.Label>
                            <Form.Control value={formData?.ethnic} type="text" autoFocus onChange={(e) => setFormData({ ...formData, ethnic: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{labels.school}</Form.Label>
                            <Form.Control value={formData?.school} type="text" placeholder="Khoa/Viện/Trường" autoFocus onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{labels.branch}</Form.Label>
                            <Form.Control value={formData?.branch} type="text" autoFocus onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                        </Form.Group>
                        {role === 'student' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Lớp</Form.Label>
                                <Form.Control value={formData?.className} type="text" onChange={(e) => setFormData({ ...formData, className: e.target.value })} />
                            </Form.Group>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>{labels.trainingSystem}</Form.Label>
                            <Form.Select value={formData?.trainingSystem} onChange={(e) => setFormData({ ...formData, trainingSystem: e.target.value })}>
                                <option value="Cử nhân">Cử nhân</option>
                                <option value="Kỹ sư">Kỹ sư</option>
                                <option value="Thạc sĩ">Thạc sĩ</option>
                                <option value="Tiến sĩ">Tiến sĩ</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Quê quán</Form.Label>
                            <Form.Control value={formData?.hometown} as="textarea" rows={3} onChange={(e) => setFormData({ ...formData, hometown: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số căn cước công dân</Form.Label>
                            <Form.Control value={formData?.identificationNumber} type="text" placeholder="040204020402" autoFocus onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control value={formData?.phone} type="text" placeholder="0987654321" autoFocus onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowEdit(false)}> Hủy </Button>
                    <Button variant="success" onClick={handleUpdate}> Cập nhật thay đổi </Button>
                </Modal.Footer>
            </Modal >
        </>
    );
}

export default UserProfilePage;