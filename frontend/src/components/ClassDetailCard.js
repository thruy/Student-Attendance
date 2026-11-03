import { Card, Container } from "react-bootstrap";
import ClassInfoRows from "./ClassInfoRows";
import '../pages/timetable.css';

// khung "Thông tin chi tiết lớp học", phần điều khiển/bảng điểm danh truyền qua children
function ClassDetailCard({ classInfo, children }) {
    return (
        <Card className="container mt-5" variant='dark' style={{ width: "100vw", marginBottom: "3rem" }}>
            <Card.Header as="h4" className="text-center">Thông tin chi tiết lớp học</Card.Header>
            <Card.Body className="p-4">
                <Container>
                    <Card.Title>{classInfo?.subjectCode} - {classInfo?.name}</Card.Title>
                    <ClassInfoRows classInfo={classInfo} />
                </Container>
                {children}
            </Card.Body>
        </Card>
    );
}

export default ClassDetailCard;
