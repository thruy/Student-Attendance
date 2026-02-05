import axios from "axios";
const API_URL = 'http://localhost:8000/api/students';

const getStudentTimetable = async () => {
    const response = await axios.get(`${API_URL}/timetable`, { withCredentials: true });
    return response.data;
}

const getInfoOfClass = async (classId) => {
    const response = await axios.get(`${API_URL}/classes/${classId}/students`, { withCredentials: true });
    return response.data;
}

const getStudentProjects = async ({ page, limit, search, semester }) => {
    const res = await axios.get(`${API_URL}/projects`, { params: { page, limit, search, semester }, withCredentials: true });
    return res.data;
};

const uploadReport = async (projectId, studentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.put(
        `${API_URL}/projects/${projectId}/students/${studentId}/report`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
};

const studentService = { getStudentTimetable, getInfoOfClass, getStudentProjects, uploadReport };
export default studentService;