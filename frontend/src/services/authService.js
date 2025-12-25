import axios from 'axios';
const API_URL = 'http://localhost:8000/api/auth';

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
    return response.data;
}

const register = async (name, email, password, code, role) => {
    const response = await axios.post(`${API_URL}/register`, { name, email, password, code, role }, { withCredentials: true });
    return response.data;
}

const logout = async () => {
    const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    return response.data;
}

const getUserInfo = async () => {
    const response = await axios.get(`${API_URL}/verify`, { withCredentials: true });
    return response.data;
}

export default {
    login, register, logout, getUserInfo
};