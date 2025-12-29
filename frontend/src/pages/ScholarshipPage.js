import { useAuth } from '../context/AuthContext'

function ScholarshipPage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Trang học bổng</h2>
            {user ? (
                <p>Chào {user.name}, bạn đang ở trang học bổng.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default ScholarshipPage;
