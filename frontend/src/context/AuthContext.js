import axios from "axios";
import { createContext, useEffect, useState } from "react";

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
    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;