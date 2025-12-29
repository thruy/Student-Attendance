import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PrivateRoute({ children }) {
    const { isAuthenticated } = useContext(AuthContext)
    if (isAuthenticated === null) {
        return <div>Đang tải...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
}

export default PrivateRoute;