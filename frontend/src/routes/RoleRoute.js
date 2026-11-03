import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleRoute({ allowedRoles = [], children }) {
    const { user, role, loading } = useAuth();
    const location = useLocation();
    if (loading) return <div>Đang tải...</div>;
    // lưu lại trang đang truy cập để quay về sau khi đăng nhập
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;

    return children;
}

export default RoleRoute;