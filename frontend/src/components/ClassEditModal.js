import { useEffect, useState } from "react";
import { Form, Modal, Button, ModalBody } from "react-bootstrap";
import adminService from "../services/adminService";

const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const semesters = ['20251', '20243', '20242', '20241', '20233', '20232', '20231'];

function ClassEditModal({ show, onHide, classInfo, onSave, teachers }) {
    const [formData, setFormData] = useState({
        subjectCode: '',
        name: '',
        classCode: '',
        type: '',
        semester: '',
        teacherId: {},
        schedule: []
    });

    useEffect(() => {
        if (classInfo) {
            setFormData({
                subjectCode: classInfo.subjectCode,
                name: classInfo.name,
                classCode: classInfo.classCode,
                type: classInfo.type,
                semester: classInfo.semester,
                teacherId: classInfo.teacher.id,
                schedule: [{
                    dayOfWeek: classInfo.schedule[0].dayOfWeek,
                    startTime: classInfo.schedule[0].startTime,
                    endTime: classInfo.schedule[0].endTime,
                    room: classInfo.schedule[0].room
                }]
            });
        }
    }, [classInfo, show]);
    const schedule = formData.schedule?.[0] || {};

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa thông tin lớp học</Modal.Title>
            </Modal.Header>

            <ModalBody>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã môn học</Form.Label>
                        <Form.Control value={formData.subjectCode} type="text" autoFocus onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Học phần</Form.Label>
                        <Form.Control value={formData.name} type="text" autoFocus onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã lớp học</Form.Label>
                        <Form.Control value={formData.classCode} type="text" autoFocus onChange={(e) => setFormData({ ...formData, classCode: e.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Loại lớp</Form.Label>
                        <Form.Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            <option value="Lý thuyết">Lý thuyết</option>
                            <option value="Thực hành">Thực hành</option>
                            <option value="Bài tập">Bài tập</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Học kỳ</Form.Label>
                        <Form.Select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })}>
                            {semesters.map((item) => (
                                <option value={item}>{item}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giảng viên</Form.Label>
                        <Form.Select value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}>
                            {teachers.map((t) => (
                                <option key={t._id} value={t._id}>{t.name} - {t.code}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Label className="fw-semibold">Lịch học</Form.Label>

                    <h5 className="mt-3">Lịch học</h5>

                    <Form.Group className="mb-2">
                        <Form.Label>Thứ</Form.Label>
                        <Form.Select
                            value={schedule.dayOfWeek}
                            onChange={(e) => setFormData({ ...formData, schedule: [{ ...schedule, dayOfWeek: e.target.value }] })}
                        >
                            {days.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Giờ bắt đầu</Form.Label>
                        <Form.Control
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => setFormData({ ...formData, schedule: [{ ...schedule, startTime: e.target.value }] })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Giờ kết thúc</Form.Label>
                        <Form.Control
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => setFormData({ ...formData, schedule: [{ ...schedule, endTime: e.target.value }] })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Phòng</Form.Label>
                        <Form.Control
                            value={schedule.room}
                            onChange={(e) => setFormData({ ...formData, schedule: [{ ...schedule, room: e.target.value }] })}
                        />
                    </Form.Group>
                </Form>
            </ModalBody>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onClick={() => onSave(classInfo.classId, formData)}> Cập nhật thay đổi </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ClassEditModal