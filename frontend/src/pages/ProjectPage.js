import { useAuth } from '../context/AuthContext'

function ProjectPage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Trang đồ án</h2>
            {user ? (
                <p>Chào {user.name}, bạn đang ở trang đồ án.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default ProjectPage;
