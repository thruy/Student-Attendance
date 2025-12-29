import { createContext, useEffect, useState, useContext } from "react";
import authService from "../services/authService";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getUserInfo();
                setUser(userData.user);
                setIsAuthenticated(true);
            } catch {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    })

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error("Lỗi đăng xuất", err)
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    }

    const login = async (email, password) => {
        await authService.login(email, password);
        const userData = await authService.getUserInfo();
        setUser(userData);
        setIsAuthenticated(true);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;