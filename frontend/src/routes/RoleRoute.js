import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleRoute({ allowedRoles = [], children }) {
    const { user, role, loading } = useAuth();
    if (loading) return <div>Đang tải...</div>;
    if (!user) return <Navigate to="/login" />;
    if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;

    return children;
}

export default RoleRoute;