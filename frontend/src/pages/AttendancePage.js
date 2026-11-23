import { Button, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import teacherService from "../services/teacherService";
import ClassDetailCard from "../components/ClassDetailCard";
import AttendanceTable from "../components/AttendanceTable";
import ManualAttendancePicker from "../components/ManualAttendancePicker";
import QrSessionStartModal from "../components/QrSessionStartModal";
import QrSessionPanel from "../components/QrSessionPanel";
import { useClassAttendance } from "../hooks/useClassAttendance";
import { useCallback, useEffect, useState } from "react";

const QR_POLLING_INTERVAL = 4000;

function AttendancePage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const fetchData = useCallback(() => teacherService.getAttendancePageData(classId), [classId]);
    const { classInfo, students, attendances, qrSession, attendanceDates, attendanceMap, loading, loadData } = useClassAttendance(fetchData);

    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    // khi có phiên QR đang diễn ra, định kỳ tải lại để cập nhật sinh viên đã điểm danh
    const qrActive = !!qrSession;
    useEffect(() => {
        if (!qrActive) return;
        const timer = setInterval(() => {
            loadData().catch(err => console.error('Lỗi khi cập nhật điểm danh QR:', err));
        }, QR_POLLING_INTERVAL);
        return () => clearInterval(timer);
    }, [qrActive, loadData]);

    const handleSaveAttendance = async (date, records) => {
        try {
            await teacherService.saveAttendance({ classId, date, type: "manual", records });
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi lưu điểm danh");
            throw err;
        }
    };

    const handleStartQrSession = async (payload) => {
        await teacherService.startQrSession(classId, payload);
        setShowQrModal(false);
        setEditMode(false);
        await loadData();
    };

    const handleEndQrSession = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn kết thúc phiên điểm danh QR không?')) return;
        try {
            await teacherService.endQrSession(classId);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết thúc phiên điểm danh");
        }
        await loadData().catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err));
    };

    const handleQrExpire = useCallback(() => {
        loadData().catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err));
    }, [loadData]);

    return (
        <>
            <ClassDetailCard classInfo={classInfo}>
                <Container className="mt-4">
                    <Button variant="dark" onClick={() => setEditMode(true)} disabled={qrActive}>Điểm danh thủ công</Button>
                    <Button variant="dark" className="ms-2" onClick={() => setShowQrModal(true)} disabled={qrActive}>Điểm danh tự động</Button>
                    <Button variant="dark" className="ms-2" onClick={() => navigate(`/teacher/teaching/exam/${classId}`)}>Chia lớp thi</Button>
                    <ManualAttendancePicker show={editMode && !qrActive} students={students} attendances={attendances} onSave={handleSaveAttendance} />
                </Container>

                {qrSession && (
                    <QrSessionPanel session={qrSession} onEnd={handleEndQrSession} onExpire={handleQrExpire} />
                )}

                <AttendanceTable students={students} attendanceDates={attendanceDates} attendanceMap={attendanceMap} />

                {loading && (
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

            <QrSessionStartModal show={showQrModal} onClose={() => setShowQrModal(false)} onStart={handleStartQrSession} />
        </>
    )
}

export default AttendancePage;
