import axios from "axios";
import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

        const fetchUser = async () => {
            try {
                const userData = await authService.getUserInfo();
                setUser(userData);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
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
        <AuthContext.Provider value={{ isAuthenticated, logout, user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;