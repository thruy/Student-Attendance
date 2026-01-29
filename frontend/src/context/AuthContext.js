import { createContext, useEffect, useState, useContext } from "react";
import authService from "../services/authService";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.verify();
                setUser(userData.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    });

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error("Lỗi đăng xuất", err)
        } finally {
            setUser(null);
        }
    }

    const login = async (email, password) => {
        const userData = await authService.login(email, password);
        setUser(userData.user);
        return userData.user;
    };

    return (
        <AuthContext.Provider value={{ login, logout, user, role: user?.role || null, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;