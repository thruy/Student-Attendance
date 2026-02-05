import axios from "axios";
const API_URL = 'http://localhost:8000/api/teachers';

const getTeacherTimetable = async () => {
    const response = await axios.get(`${API_URL}/timetable`, { withCredentials: true });
    return response.data;
}

const getAttendancePageData = async (classId) => {
    const response = await axios.get(`${API_URL}/timetable/${classId}/attendance`, { withCredentials: true });
    return response.data;
}

const saveAttendance = async ({ classId, date, type, records }) => {
    const response = await axios.post(`${API_URL}/timetable/attendance/save`, { classId, date, type, records }, { withCredentials: true });
    return response.data;
}

const getAllProjects = async ({ page, limit, search, semester }) => {
    const res = await axios.get(`${API_URL}/projects`, { params: { page, limit, search, semester }, withCredentials: true });
    return res.data;
};

const getProjectDetail = async (projectId) => {
    const res = await axios.get(`${API_URL}/projects/${projectId}`, { withCredentials: true });
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

const gradeStudent = async (projectId, studentId, data) => {
    const response = await axios.put(`${API_URL}/projects/${projectId}/students/${studentId}/grade`, data, { withCredentials: true });
    return response.data;
};

const updateTitleForStudent = async (projectId, studentId, title) => {
    const response = await axios.put(`${API_URL}/projects/${projectId}/students/${studentId}/title`, { title }, { withCredentials: true });
    return response.data;
};

const teacherService = {
    getTeacherTimetable, getAttendancePageData, saveAttendance,
    getAllProjects, getProjectDetail, uploadReport, gradeStudent, updateTitleForStudent
};
export default teacherService;