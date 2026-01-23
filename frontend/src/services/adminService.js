import axios from "axios";
const API_URL = 'http://localhost:8000/api/admin';

const getAllStudent = async ({ page, limit, search }) => {
    const res = await axios.get(`${API_URL}/student`, { params: { page, limit, search }, withCredentials: true });
    return res.data;
}

const getStudentDetail = async (studentId) => {
    const res = await axios.get(`${API_URL}/student/${studentId}`, { withCredentials: true });
    return res.data;
};

const createStudent = async (payload) => {
    const res = await axios.post(`${API_URL}/students`, payload, { withCredentials: true });
    return res.data;
};

const updateStudent = async (studentId, payload) => {
    const res = await axios.put(`${API_URL}/students/${studentId}`, payload, { withCredentials: true });
    return res.data;
}

const resetStudentPassword = async (studentId) => {
    const res = await axios.put(`${API_URL}/students/${studentId}/reset-password`, {}, { withCredentials: true });
    return res.data;
};


const adminService = { getAllStudent, getStudentDetail, updateStudent, resetStudentPassword, createStudent };
export default adminService;