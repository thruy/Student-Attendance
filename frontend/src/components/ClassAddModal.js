import { Modal, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const semesters = ['20251', '20243', '20242', '20241', '20233', '20232', '20231'];

function ClassAddModal({ show, onHide, onSave, teachers }) {
    const [startDate, setStartDate] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        subjectCode: '',
        classCode: '',
        semester: '',
        type: '',
        teacherId: '',
        schedule: [{
            dayOfWeek: '',
            startTime: '',
            endTime: '',
            room: ''
        }],
        date: []
    });
    const schedule = formData.schedule?.[0] || {};
    const generateClassDates = (startDate, totalWeeks = 16) => {
        const dates = [];
        const start = new Date(startDate);

        for (let i = 0; i < totalWeeks; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i * 7);
            dates.push(d);
        }

        return dates;
    };

    const handleSave = () => {
        const dates = generateClassDates(startDate);
        const payload = { ...formData, date: dates };
        onSave(payload);
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered size='large'>
            <Modal.Header closeButton>
                <Modal.Title>Thêm lớp học mới</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã học phần</Form.Label>
                        <Form.Control value={formData.subjectCode} type="text" autoFocus onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Học phần</Form.Label>
                        <Form.Control value={formData.name} type="text" autoFocus onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mã lớp học</Form.Label>
                        <Form.Control value={formData.classCode} type="text" autoFocus onChange={(e) => setFormData({ ...formData, classCode: e.target.value })} required />
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
                            <option value=''>Chọn học kỳ</option>
                            {semesters.map((item) => (
                                <option value={item}>{item}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Buổi học đầu</Form.Label>
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Giảng viên</Form.Label>
                        <Form.Select value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}>
                            <option value=''>Chọn giảng viên</option>
                            {teachers.map((t) => (
                                <option key={t._id} value={t._id}>{t.name} - {t.code}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <h5 className="mt-3">Lịch học</h5>
                    <Form.Group className="mb-2">
                        <Form.Label>Thứ</Form.Label>
                        <Form.Select value={schedule.dayOfWeek} onChange={(e) => setFormData({ ...formData, schedule: [{ ...schedule, dayOfWeek: e.target.value }] })}                        >
                            <option value=''>Chọn thứ</option>
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
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide}> Hủy </Button>
                <Button variant="success" onClick={handleSave}> Thêm lớp học </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ClassAddModal;