import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import teacherService from "../services/teacherService";
import adminService from "../services/adminService";
import InfoRow from "../components/InfoRow";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceModal from "../components/AttendanceModal";
import QrSessionStartModal from "../components/QrSessionStartModal";
import QrSessionPanel from "../components/QrSessionPanel";
import { compareVietnameseName, formatDateTime, formatTime } from "../utils/exam";
import { todayInVN } from "../utils/date";
import './timetable.css';

const QR_POLLING_INTERVAL = 4000;

// khác biệt giữa trang điểm danh lớp thi của giảng viên (cán bộ coi thi / giảng viên của lớp) và admin
// canDelete: chỉ admin được xóa phiên điểm danh, giống phiên điểm danh buổi học
const CONFIG = {
    teacher: { service: teacherService, canDelete: false },
    admin: { service: adminService, canDelete: true }
};

// lý do không được điểm danh, hiển thị dưới các nút
const permissionNote = (permissions, examDate, role) => {
    if (!permissions.edit) return 'Bạn chỉ được xem kết quả điểm danh. Chỉ cán bộ coi thi của lớp thi và admin mới được điểm danh.';
    if (permissions.qr) return '';
    const today = todayInVN();
    if (today < examDate) return `Chưa đến ngày thi (${examDate}), chưa thể điểm danh.`;
    return role === 'admin'
        ? 'Đã qua ngày thi, không thể điểm danh bằng QR. Admin vẫn có thể điểm danh thủ công.'
        : 'Đã qua ngày thi, không thể điểm danh.';
};

// role: 'teacher' | 'admin'
function ExamAttendancePage({ role }) {
    const { service, canDelete } = CONFIG[role];
    const { classId, examCode } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showManual, setShowManual] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadData = useCallback(async () => {
        const res = await service.getExamRoomAttendance(classId, examCode);
        setData(res);
    }, [service, classId, examCode]);

    useEffect(() => {
        loadData()
            .catch(err => setError(err.response?.data?.message || 'Lỗi khi tải thông tin điểm danh lớp thi'))
            .finally(() => setLoading(false));
    }, [loadData]);

    // khi có phiên QR đang diễn ra, định kỳ tải lại để cập nhật sinh viên đã điểm danh
    const qrActive = !!data?.qrSession;
    useEffect(() => {
        if (!qrActive) return;
        const timer = setInterval(() => {
            loadData().catch(err => console.error('Lỗi khi cập nhật điểm danh QR:', err));
        }, QR_POLLING_INTERVAL);
        return () => clearInterval(timer);
    }, [qrActive, loadData]);

    const students = useMemo(() => [...(data?.students || [])].sort(compareVietnameseName), [data]);
    const examDate = data?.room.date;
    const records = data?.attendance?.records;
    const attendanceMap = useMemo(() => {
        const recordMap = {};
        records?.forEach(r => { recordMap[r.studentId] = r.status; });
        return { [examDate]: { recordMap } };
    }, [records, examDate]);
    // chưa có phiên điểm danh: mặc định tất cả có mặt
    const initialRecords = useMemo(
        () => records || students.map(s => ({ studentId: s.id, status: "yes" })),
        [records, students]
    );
    const presentCount = records?.filter(r => r.status === 'yes').length || 0;

    const handleSaveManual = async (records) => {
        try {
            await service.saveExamRoomAttendance(classId, examCode, records);
            setShowManual(false);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi lưu điểm danh");
        }
    };

    const handleStartQrSession = async (payload) => {
        await service.startExamQrSession(classId, examCode, payload);
        setShowQrModal(false);
        await loadData();
    };

    const handleEndQrSession = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn kết thúc phiên điểm danh QR không?')) return;
        try {
            await service.endExamQrSession(classId, examCode);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi kết thúc phiên điểm danh");
        }
        await loadData().catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err));
    };

    const handleDeleteAttendance = async () => {
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa phiên điểm danh lớp thi ${examCode} không? `
            + 'Nếu lớp học không còn lớp thi nào được điểm danh, danh sách lớp thi sẽ được mở khóa để chia lại.'
        );
        if (!confirmDelete) return;

        try {
            setDeleting(true);
            await service.deleteExamRoomAttendance(classId, examCode);
            await loadData();
        } catch (err) {
            setError(`Xóa phiên điểm danh thất bại: ${err.response?.data?.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const handleQrExpire = useCallback(() => {
        loadData().catch(err => console.error('Lỗi khi tải dữ liệu điểm danh:', err));
    }, [loadData]);

    if (loading) {
        return (
            <div>
                <Spinner animation="border" role="status"></Spinner>
                <span>Đang tải thông tin...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Lỗi khi tải dữ liệu!</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-dark" onClick={() => navigate(-1)}>Quay lại</Button>
            </Alert>
        );
    }

    const { class: classInfo, room, permissions } = data;
    const note = permissionNote(permissions, examDate, role);

    return (
        <>
            <Card className="container mt-5" style={{ width: "100vw", marginBottom: "3rem" }}>
                <Card.Header as="h4" className="text-center">Điểm danh lớp thi</Card.Header>
                <Card.Body className="p-4">
                    <Container>
                        <Card.Title>{classInfo.subjectCode} - {classInfo.name}</Card.Title>
                        <InfoRow label="Mã lớp học" value={classInfo.classCode} />
                        <InfoRow label="Mã lớp thi" value={room.examCode} />
                        <InfoRow label="Phòng thi" value={room.room} />
                        <InfoRow label="Thời gian" value={`${formatDateTime(room.startTime)} - ${formatTime(room.endTime)}`} />
                        <InfoRow label="Cán bộ coi thi" value={room.invigilators.map(t => t.name).join(', ')} />
                        <InfoRow label="Có mặt" value={`${presentCount}/${students.length} sinh viên`} />
                    </Container>

                    <Container className="mt-4">
                        <Button variant="outline-dark" onClick={() => navigate(-1)}>Quay lại</Button>
                        <Button variant="dark" className="ms-2" onClick={() => setShowManual(true)} disabled={!permissions.manual || qrActive}>Điểm danh thủ công</Button>
                        <Button variant="dark" className="ms-2" onClick={() => setShowQrModal(true)} disabled={!permissions.qr || qrActive}>Điểm danh tự động</Button>
                        {canDelete && data.attendance && (
                            <Button variant="outline-danger" className="ms-2" onClick={handleDeleteAttendance} disabled={deleting}>
                                {deleting ? 'Đang xóa...' : 'Xóa phiên điểm danh'}
                            </Button>
                        )}
                        {note && <div className="text-muted mt-2">{note}</div>}
                    </Container>

                    {data.qrSession && (
                        <QrSessionPanel session={data.qrSession} onEnd={handleEndQrSession} onExpire={handleQrExpire} />
                    )}

                    {error && (
                        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>{error}</Alert>
                    )}

                    <div className="mt-4">
                        <AttendanceTable students={students} attendanceDates={[examDate]} attendanceMap={attendanceMap} />
                    </div>
                </Card.Body>
            </Card>

            <AttendanceModal
                show={showManual}
                onClose={() => setShowManual(false)}
                students={students}
                date={examDate}
                initialRecords={initialRecords}
                onSave={handleSaveManual}
            />
            <QrSessionStartModal show={showQrModal} onClose={() => setShowQrModal(false)} onStart={handleStartQrSession} />
        </>
    );
}

export default ExamAttendancePage;
