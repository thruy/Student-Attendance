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

const startQrSession = async (classId, { date, duration, lat, lng, accuracy }) => {
    const response = await axios.post(`${API_URL}/timetable/${classId}/qr-session`, { date, duration, lat, lng, accuracy }, { withCredentials: true });
    return response.data;
}

const endQrSession = async (classId) => {
    const response = await axios.post(`${API_URL}/timetable/${classId}/qr-session/end`, {}, { withCredentials: true });
    return response.data;
}

const getClassExam = async (classId) => {
    const response = await axios.get(`${API_URL}/timetable/${classId}/exam`, { withCredentials: true });
    return response.data;
}

const saveClassExam = async (classId, payload) => {
    const response = await axios.put(`${API_URL}/timetable/${classId}/exam`, payload, { withCredentials: true });
    return response.data;
}

const deleteClassExam = async (classId) => {
    const response = await axios.delete(`${API_URL}/timetable/${classId}/exam`, { withCredentials: true });
    return response.data;
}

// coi thi
const getMyInvigilations = async () => {
    const response = await axios.get(`${API_URL}/exams`, { withCredentials: true });
    return response.data;
}

const examRoomUrl = (classId, examCode) => `${API_URL}/exams/${classId}/rooms/${encodeURIComponent(examCode)}`;

const getExamRoomAttendance = async (classId, examCode) => {
    const response = await axios.get(`${examRoomUrl(classId, examCode)}/attendance`, { withCredentials: true });
    return response.data;
}

const saveExamRoomAttendance = async (classId, examCode, records) => {
    const response = await axios.post(`${examRoomUrl(classId, examCode)}/attendance`, { records }, { withCredentials: true });
    return response.data;
}

const startExamQrSession = async (classId, examCode, { duration, lat, lng, accuracy }) => {
    const response = await axios.post(`${examRoomUrl(classId, examCode)}/qr-session`, { duration, lat, lng, accuracy }, { withCredentials: true });
    return response.data;
}

const endExamQrSession = async (classId, examCode) => {
    const response = await axios.post(`${examRoomUrl(classId, examCode)}/qr-session/end`, {}, { withCredentials: true });
    return response.data;
}

// photo: Blob JPEG chụp từ camera
const faceCheckIn = async (classId, examCode, photo) => {
    const formData = new FormData();
    formData.append('photo', photo, 'frame.jpg');
    const response = await axios.post(`${examRoomUrl(classId, examCode)}/face-checkin`, formData, { withCredentials: true });
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
    getTeacherTimetable, getAttendancePageData, saveAttendance, startQrSession, endQrSession,
    getClassExam, saveClassExam, deleteClassExam,
    getMyInvigilations, getExamRoomAttendance, saveExamRoomAttendance, startExamQrSession, endExamQrSession, faceCheckIn,
    getAllProjects, getProjectDetail, uploadReport, gradeStudent, updateTitleForStudent
};
export default teacherService;