import { useEffect, useState } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { CheckCircle, XCircleFill, Circle } from "react-bootstrap-icons";

function AttendanceModal({ show, onClose, students, date, initialRecords, onSave }) {
    const [records, setRecords] = useState({});
    useEffect(() => {
        const init = {};
        initialRecords?.forEach(r => {
            init[r.studentId] = r.status;
        });
        // sinh viên chưa có trong danh sách điểm danh: để trống cho giảng viên xử lý
        students?.forEach(s => {
            if (!(s.id in init)) init[s.id] = null;
        });
        setRecords(init);
    }, [students, initialRecords])

    const toggleStatus = (studentId) => {
        setRecords(prev => ({
            ...prev,
            [studentId]: prev[studentId] === "yes" ? "no" : "yes"
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
                            <tr key={s.id}>
                                <td>{index + 1}</td>
                                <td>{s.code}</td>
                                <td>{s.name}</td>
                                <td className="text-center" style={{ cursor: "pointer" }}>
                                    {records[s.id] === "yes" && (
                                        <CheckCircle size={20} color="royalblue" onClick={() => toggleStatus(s.id)} />
                                    )}
                                    {records[s.id] === "no" && (
                                        <XCircleFill size={20} color="red" onClick={() => toggleStatus(s.id)} />
                                    )}
                                    {!records[s.id] && (
                                        <Circle size={20} color="gray" onClick={() => toggleStatus(s.id)} title="Chưa điểm danh" />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onClose}>Hủy điểm danh</Button>
                <Button variant="success" onClick={handleSave} >Lưu kết quả</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AttendanceModal;