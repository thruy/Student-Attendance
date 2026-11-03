import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import AttendanceModal from "./AttendanceModal";
import { toDateKey } from "../hooks/useClassAttendance";

// chọn ngày + mở modal điểm danh thủ công; onSave(date, records) lỗi thì giữ modal mở
function ManualAttendancePicker({ show, students, attendances, onSave }) {
    const [selectedDate, setSelectedDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [initialRecords, setInitialRecords] = useState([]);

    const handleOpen = () => {
        const existed = attendances.find(a => toDateKey(a.date) === selectedDate);
        setInitialRecords(existed
            ? existed.records
            : students.map(s => ({ studentId: s.id, status: "yes" })));
        setShowModal(true);
    };

    const handleSave = async (records) => {
        try {
            await onSave(selectedDate, records);
            setShowModal(false);
        } catch {
            // trang cha đã hiển thị lỗi
        }
    };

    return (
        <>
            {show && (
                <div className="d-flex align-items-center gap-3 mt-3">
                    <Form.Control
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-3" style={{ width: '300px' }}
                    />
                    <Button className="mt-3" onClick={handleOpen} disabled={!selectedDate}>Bắt đầu</Button>
                </div>
            )}
            <AttendanceModal show={showModal} onClose={() => setShowModal(false)} students={students} date={selectedDate} initialRecords={initialRecords} onSave={handleSave} />
        </>
    );
}

export default ManualAttendancePicker;
