import { Button, Container, Form, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import adminService from "../services/adminService";
import ClassDetailCard from "../components/ClassDetailCard";
import AttendanceTable from "../components/AttendanceTable";
import ManualAttendancePicker from "../components/ManualAttendancePicker";
import { useClassAttendance } from "../hooks/useClassAttendance";
import { useCallback, useState } from "react";

function AdminAttendancePage() {
    const { classId } = useParams();
    const fetchData = useCallback(() => adminService.getClassDetail(classId), [classId]);
    const { classInfo, students, attendances, attendanceDates, attendanceMap, loading, loadData } = useClassAttendance(fetchData);

    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    // 'manual' | 'delete' | null
    const [mode, setMode] = useState(null);
    const [deleteDate, setDeleteDate] = useState('');

    const handleSaveAttendance = async (date, records) => {
        try {
            await adminService.saveAttendance({ classId, date, type: "manual", records });
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi lưu điểm danh");
            throw err;
        }
    };

    const deleteAttendance = async (date) => {
        if (!classId || !date) return;
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa phiên điểm danh ngày ${date} không?`);
        if (!confirmDelete) return;

        try {
            setDeleting(true);
            await adminService.deleteAttendance(classId, date);
            await loadData();
            setDeleteDate('');
        } catch (err) {
            setError(`Xóa phiên điểm danh thất bại: ${err.response?.data?.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <ClassDetailCard classInfo={classInfo}>
                <Container className="mt-4">
                    <Button variant="dark" onClick={() => setMode('manual')}>Điểm danh thủ công</Button>
                    <Button variant="dark" className="ms-2" disabled>Điểm danh tự động</Button>
                    <Button variant="dark" className="ms-2" onClick={() => setMode('delete')}>Xóa phiên điểm danh</Button>
                    <ManualAttendancePicker show={mode === 'manual'} students={students} attendances={attendances} onSave={handleSaveAttendance} />
                    {mode === 'delete' && (
                        <div className="d-flex align-items-center gap-3 mt-3">
                            <Form.Select
                                value={deleteDate}
                                onChange={(e) => setDeleteDate(e.target.value)}
                                className="mt-3" style={{ width: '300px' }}
                            >
                                <option value="">Xóa phiên ngày</option>
                                {attendanceDates.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </Form.Select>
                            <Button className="mt-3" onClick={() => deleteAttendance(deleteDate)} disabled={!deleteDate}>Xóa</Button>
                        </div>
                    )}
                </Container>

                <AttendanceTable students={students} attendanceDates={attendanceDates} attendanceMap={attendanceMap} />

                {(loading || deleting) && (
                    <div>
                        <Spinner animation="border" role="status"></Spinner>
                        <span>Đang tải thông tin...</span>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                        <p>{error}</p>
                    </Alert>
                )}
            </ClassDetailCard>
        </>
    )
}

export default AdminAttendancePage;
