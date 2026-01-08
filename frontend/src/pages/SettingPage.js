import { useAuth } from '../context/AuthContext'

function SettingPage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Trang cài đặt</h2>
            {user ? (
                <p>Chào {user.name}, bạn đang ở trang cài đặt.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default SettingPage;
