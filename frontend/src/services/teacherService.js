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

const createAttendanceSession = async (classId, date) => {
    const response = await axios.post(`${API_URL}/timetable/${classId}/attendance/create`, { date }, { withCredentials: true });
    return response.data;
}

const teacherService = { getTeacherTimetable, getAttendancePageData, createAttendanceSession };
export default teacherService;