import { useAuth } from '../context/AuthContext'

function Main() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Trang chủ</h2>
            {user ? (
                <p>Chào {user.name}, bạn đã đăng nhập thành công.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default Main;
