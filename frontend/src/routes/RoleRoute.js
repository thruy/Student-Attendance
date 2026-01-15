import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function RoleRoute({ role, children }) {
    const { user, loading } = useContext(AuthContext)
    if (loading) return <div>Đang tải...</div>;
    if (!user) return <Navigate to="/login" />;
    if (!role.includes(user.role)) return <Navigate to="/login" replace />;

    return children;
}

export default RoleRoute;