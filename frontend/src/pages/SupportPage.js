import { useAuth } from '../context/AuthContext'

function SupportPage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Hỗ trợ sinh viên</h2>
            {user ? (
                <p>Chào {user.name}, bạn đang ở trang hỗ trợ.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default SupportPage;
