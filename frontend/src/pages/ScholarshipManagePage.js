import { useAuth } from '../context/AuthContext'

function ScholarshipManagePage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Trang quản lý học bổng</h2>
            {user ? (
                <p>Chào {user.name}, bạn đã đăng nhập thành công.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default ScholarshipManagePage;
