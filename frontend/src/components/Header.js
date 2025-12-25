import appIcon from '../assets/logo192.png';

function Header() {
    return (
        <div className="bg-light">
            <div className="container py-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <img src={appIcon} alt="App Icon" width="40" height="40" className="me-3" />
                    <h5 className="mb-0 fw-bold">Student Attendance System</h5>
                </div>

                <div className="text-muted">Quản lý điểm danh sinh viên</div>
            </div>
        </div>
    );
}

export default Header;
