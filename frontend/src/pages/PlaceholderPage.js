import { useAuth } from '../context/AuthContext'

// trang tạm cho các chức năng chưa phát triển
function PlaceholderPage({ title, description }) {
    const { user } = useAuth();

    return (
        <div>
            <h2>{title}</h2>
            {user ? (
                <p>Chào {user.name}, {description}</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default PlaceholderPage;
