import { useAuth } from '../context/AuthContext'

function StudyPage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Trang học tập</h2>
            {user ? (
                <p>Chào {user.name}, bạn đang ở trang học tập.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default StudyPage;
