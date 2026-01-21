import { useAuth } from '../context/AuthContext'

function ProjectManagePage() {
    const { user } = useAuth();

    return (
        <div>
            <h2>Quản lý đồ án</h2>
            {user ? (
                <p>Chào {user.name}, bạn đã đăng nhập thành công.</p>
            ) : (
                <p>Đang tải...</p>
            )}
        </div>
    );
}

export default ProjectManagePage;
