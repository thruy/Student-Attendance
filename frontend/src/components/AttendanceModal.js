import { useEffect } from "react";
import { Modal } from "react-bootstrap";

function AttendanceModal({ show, onClose, students, date, initialRecords, onSave, loading }) {
    const [records, setRecords] = useState({});
    useEffect(() => {
        const init = {};
        initialRecords?.forEach(r => {
            init[r.studentId] = r.status === 'yes';
        });
        setRecords(init);
    }, [students, initialRecords])

    const toggleStatus = (studentId) => {
        setRecords(prev => ({
            ...prev,
            [studentId]: prev[studentId] === true ? false : true
        }));
    };

    const handleSave = () => {
        const formatted = Object.entries(records).map(
            ([studentId, status]) => ({ studentId, status })
        );
        onSave(formatted);
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Điểm danh ngày {date}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>MSSV</th>
                            <th>Họ va tên</th>
                            <th>Có mặt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, index) => (
                            <tr key={s._id}>
                                <td>{index + 1}</td>
                                <td>{s.code}</td>
                                <td>{s.name}</td>
                                <td>
                                    <input type="checkbox" checked={records[s._id] === true} onChange={() => toggleStatus(s._id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onClose}>Hủy điểm danh</Button>
                <Button variant="success" onClick={handleSave} disabled={loading}> {loading ? 'Đang lưu...' : 'Lưu kết quả'}</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AttendanceModal;