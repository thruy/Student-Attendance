import { useEffect, useState } from "react";
import { Button, Card, Row, Col, InputGroup, Form } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";

const formatRemaining = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
};

function QrSessionPanel({ session, onEnd, onExpire }) {
    const [remaining, setRemaining] = useState(() => new Date(session.expiresAt) - Date.now());
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const expiresAt = new Date(session.expiresAt).getTime();
        setRemaining(expiresAt - Date.now());
        const timer = setInterval(() => {
            const left = expiresAt - Date.now();
            setRemaining(left);
            if (left <= 0) {
                clearInterval(timer);
                onExpire();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [session.expiresAt, onExpire]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(session.qrUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="mt-4 border-success">
            <Card.Header as="h5" className="text-center">Phiên điểm danh QR đang diễn ra</Card.Header>
            <Card.Body>
                <Row className="align-items-center">
                    <Col md={5} className="text-center mb-3 mb-md-0">
                        <QRCodeSVG value={session.qrUrl} size={240} />
                    </Col>
                    <Col md={7}>
                        <p className="mb-2"><strong>Ngày điểm danh:</strong> {session.date}</p>
                        <p className="mb-2"><strong>Thời gian còn hiệu lực:</strong> <span className="fs-5">{formatRemaining(remaining)}</span></p>
                        <p className="mb-2"><strong>Đã điểm danh:</strong> <span className="fs-5 text-success">{session.checkedIn}/{session.total}</span> sinh viên</p>
                        <p className="mb-3">
                            <strong>Phạm vi vị trí:</strong>{' '}
                            {session.hasLocation ? `trong bán kính ${session.radius} m` : 'không kiểm tra vị trí'}
                        </p>
                        <InputGroup className="mb-3">
                            <Form.Control value={session.qrUrl} readOnly />
                            <Button variant="outline-secondary" onClick={handleCopy}>{copied ? 'Đã sao chép' : 'Sao chép link'}</Button>
                        </InputGroup>
                        <Button variant="danger" onClick={onEnd}>Kết thúc phiên điểm danh</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default QrSessionPanel;
