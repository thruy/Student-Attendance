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

const getQrSessionInfo = async (token) => {
    const response = await axios.get(`${API_URL}/attendance/qr`, { params: { token }, withCredentials: true });
    return response.data;
}

const checkInByQr = async ({ token, lat, lng, accuracy }) => {
    const response = await axios.post(`${API_URL}/attendance/qr`, { token, lat, lng, accuracy }, { withCredentials: true });
    return response.data;
}

const getMyExams = async () => {
    const response = await axios.get(`${API_URL}/exams`, { withCredentials: true });
    return response.data;
}

// ảnh khuôn mặt để điểm danh lớp thi
const getFaceStatus = async () => {
    const response = await axios.get(`${API_URL}/face`, { withCredentials: true });
    return response.data;
}

// photo: Blob JPEG
const uploadFacePhoto = async (photo) => {
    const formData = new FormData();
    formData.append('photo', photo, 'face.jpg');
    const response = await axios.post(`${API_URL}/face`, formData, { withCredentials: true });
    return response.data;
}

// dùng trực tiếp trong <img src>, cookie đăng nhập được gửi kèm
const facePhotoUrl = (version) => `${API_URL}/face/photo${version ? `?v=${encodeURIComponent(version)}` : ''}`;

const studentService = {
    getStudentTimetable, getInfoOfClass, getStudentProjects, uploadReport, getQrSessionInfo, checkInByQr, getMyExams,
    getFaceStatus, uploadFacePhoto, facePhotoUrl
};
export default studentService;