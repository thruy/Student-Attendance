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

const studentService = { getStudentTimetable, getInfoOfClass };
export default studentService;