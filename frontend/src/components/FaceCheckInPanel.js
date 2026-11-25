import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { captureFrame, openCamera, stopCamera } from "../utils/camera";

const CAPTURE_INTERVAL = 2000;
// sau mỗi kết quả (thành công / thất bại) dừng chụp một lúc để sinh viên kịp rời khỏi khung hình
const RESULT_PAUSE = 3000;

const WAITING = { variant: 'secondary', text: 'Đang chờ sinh viên đứng trước camera...' };

// mở camera, tự động chụp định kỳ và gửi lên backend để nhận diện
// onCapture(blob) -> dữ liệu trả về của API face-checkin; onCheckedIn() khi có sinh viên vừa điểm danh
function FaceCheckInPanel({ onCapture, onCheckedIn, onClose }) {
    const videoRef = useRef(null);
    const busyRef = useRef(false);
    const pausedUntilRef = useRef(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [running, setRunning] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [status, setStatus] = useState(WAITING);

    useEffect(() => {
        let stream;
        let cancelled = false;
        openCamera()
            .then(s => {
                if (cancelled) { stopCamera(s); return; }
                stream = s;
                videoRef.current.srcObject = s;
                setCameraReady(true);
                setRunning(true);
            })
            .catch(err => setCameraError(err.message));
        return () => {
            cancelled = true;
            stopCamera(stream);
        };
    }, []);

    const showResult = (result) => {
        setStatus(result);
        pausedUntilRef.current = Date.now() + RESULT_PAUSE;
    };

    const captureOnce = useCallback(async () => {
        if (busyRef.current || Date.now() < pausedUntilRef.current) return;
        busyRef.current = true;
        try {
            const data = await onCapture(await captureFrame(videoRef.current));
            if (!data.matched) {
                showResult({ variant: 'danger', text: `Thất bại: ${data.message}` });
            } else if (data.alreadyCheckedIn) {
                showResult({ variant: 'info', text: `${data.student.name} (${data.student.code}) đã được điểm danh trước đó` });
            } else {
                showResult({ variant: 'success', text: `Điểm danh thành công: ${data.student.name} (${data.student.code})` });
                onCheckedIn();
            }
        } catch (err) {
            const res = err.response;
            if (res?.data?.code === 'NO_FACE') {
                setStatus(WAITING);
            } else if (res?.status === 422) {
                // nhiều khuôn mặt, ảnh giả mạo...
                showResult({ variant: 'danger', text: `Thất bại: ${res.data.message}` });
            } else {
                // lỗi quyền, dịch vụ nhận diện không chạy...: dừng chụp tự động để không gửi liên tục
                setRunning(false);
                setStatus({ variant: 'danger', text: res?.data?.message || err.message || 'Lỗi khi nhận diện khuôn mặt' });
            }
        } finally {
            busyRef.current = false;
        }
    }, [onCapture, onCheckedIn]);

    useEffect(() => {
        if (!running) return;
        const timer = setInterval(captureOnce, CAPTURE_INTERVAL);
        return () => clearInterval(timer);
    }, [running, captureOnce]);

    const handleResume = () => {
        pausedUntilRef.current = 0;
        setStatus(WAITING);
        setRunning(true);
    };

    return (
        <Card className="mt-4 border-primary">
            <Card.Header as="h5" className="text-center">Điểm danh bằng khuôn mặt</Card.Header>
            <Card.Body className="text-center">
                {cameraError ? (
                    <Alert variant="danger">{cameraError}</Alert>
                ) : (
                    <>
                        {/* lật ngang để hiển thị như soi gương, ảnh gửi đi vẫn là khung hình gốc */}
                        <video
                            ref={videoRef} autoPlay muted playsInline
                            style={{ width: '100%', maxWidth: '640px', borderRadius: '8px', transform: 'scaleX(-1)', background: '#000' }}
                        />
                        <Alert variant={status.variant} className="mt-3 mb-0 fs-5">{status.text}</Alert>
                    </>
                )}
                <div className="mt-3 d-flex justify-content-center gap-2">
                    {cameraReady && !running && (
                        <Button variant="dark" onClick={handleResume}>Tiếp tục nhận diện</Button>
                    )}
                    <Button variant="danger" onClick={onClose}>Tắt camera</Button>
                </div>
            </Card.Body>
        </Card>
    );
}

export default FaceCheckInPanel;
