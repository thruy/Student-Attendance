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

const adminService = { getAllStudent, getStudentDetail };
export default adminService;