import axios from 'axios';
const API_URL = 'http://localhost:3000';

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
    return response.data;
}

const register = async (name, email, password, role) => {
    const response = await axios.post(`${API_URL}/register`, { name, email, password, role }, { withCredentials: true });
    return response.data;
}

export default {
    login,
    register
};