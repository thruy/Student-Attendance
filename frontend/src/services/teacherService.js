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

const teacherService = { getTeacherTimetable, getAttendancePageData, saveAttendance };
export default teacherService;