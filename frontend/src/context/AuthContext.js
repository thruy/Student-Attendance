import axios from "axios";
import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await axios.get('http://localhost:8000/api/auth/verify', { withCredentials: true })
                setIsAuthenticated(true)
            } catch {
                setIsAuthenticated(false)
            }
        }
        verifyAuth();
    }, [])

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error("Lỗi đăng xuất", err)
        } finally {
            setIsAuthenticated(false)
        }
    }
    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;