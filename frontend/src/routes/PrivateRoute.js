import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function PrivateRoute({ children }) {
    const { isAuthenticated } = useContext(AuthContext)

    // useEffect(() => {
    //     const checkAuth = async () => {
    //         try {
    //             await axios.get('http://localhost:8000/api/auth/verify', { withCredentials: true });
    //             setIsAuthenticated(true);
    //         } catch (error) {
    //             setIsAuthenticated(false);
    //         }
    //     };
    //     checkAuth();
    // }, []);

    if (isAuthenticated === null) {
        return <div>Đang tải...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
}

export default PrivateRoute;