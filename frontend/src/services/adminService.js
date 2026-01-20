import axios from "axios";
const API_URL = 'http://localhost:8000/api/admin';

const getAllStudent = async () => {
    const res = await axios.get(`${API_URL}/student`);
    return res.data;
}

const adminService = { getAllStudent };
export default adminService;