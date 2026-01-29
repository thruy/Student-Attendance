import axios from "axios";
const API_URL = 'http://localhost:8000/api/admin';

//student
const getAllStudent = async ({ page, limit, search }) => {
    const res = await axios.get(`${API_URL}/students`, { params: { page, limit, search }, withCredentials: true });
    return res.data;
}

const getStudentDetail = async (studentId) => {
    const res = await axios.get(`${API_URL}/students/${studentId}`, { withCredentials: true });
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
//teacher 
const getAllTeacher = async ({ page, limit, search }) => {
    const res = await axios.get(`${API_URL}/teachers`, { params: { page, limit, search }, withCredentials: true });
    return res.data;
}

const getTeacherDetail = async (teacherId) => {
    const res = await axios.get(`${API_URL}/teachers/${teacherId}`, { withCredentials: true });
    return res.data;
};

const createTeacher = async (payload) => {
    const res = await axios.post(`${API_URL}/teachers`, payload, { withCredentials: true });
    return res.data;
};

const updateTeacher = async (teacherId, payload) => {
    const res = await axios.put(`${API_URL}/teachers/${teacherId}`, payload, { withCredentials: true });
    return res.data;
}

const resetTeacherPassword = async (teacherId) => {
    const res = await axios.put(`${API_URL}/teachers/${teacherId}/reset-password`, {}, { withCredentials: true });
    return res.data;
};
const adminService = {
    getAllStudent, getStudentDetail, updateStudent, resetStudentPassword, createStudent,
    getAllTeacher, getTeacherDetail, updateTeacher, resetTeacherPassword, createTeacher,
};
export default adminService;