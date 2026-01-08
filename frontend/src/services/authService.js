import axios from 'axios';
const API_URL = 'http://localhost:8000/api/auth';

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
    return response.data;
}

const register = async (name, gender, dob, email, password) => {
    const response = await axios.post(`${API_URL}/register`, { name, gender, dob, email, password }, { withCredentials: true });
    return response.data;
}

const logout = async () => {
    const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    return response.data;
}

const getUserInfo = async () => {
    const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
    return response.data;
}

const updateUserInfo = async (formData) => {
    const response = await axios.put(`${API_URL}/profile`, formData, { withCredentials: true });
    return response.data;
}

const changePassword = async (formData) => {
    const response = await axios.put(`${API_URL}/change-password`, formData, { withCredentials: true });
    return response.data;
}

const authService = { login, register, logout, getUserInfo, updateUserInfo, changePassword };
export default authService;