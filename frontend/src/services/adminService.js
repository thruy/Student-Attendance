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

const deleteTeacher = async (teacherId) => {
    const res = await axios.delete(`${API_URL}/teachers/${teacherId}`, { withCredentials: true });
    return res.data;
};

//class
const getAllClasses = async ({ page, limit, search, semester }) => {
    const res = await axios.get(`${API_URL}/classes`, { params: { page, limit, search, semester }, withCredentials: true });
    return res.data;
};

const getClassDetail = async (classId) => {
    const res = await axios.get(`${API_URL}/classes/${classId}`, { withCredentials: true });
    return res.data;
};

const createClass = async (payload) => {
    const res = await axios.post(`${API_URL}/classes`, payload, { withCredentials: true });
    return res.data;
};

const saveAttendance = async ({ classId, date, type, records }) => {
    const res = await axios.post(`${API_URL}/classes/${classId}/attendance`, { classId, date, type, records }, { withCredentials: true });
    return res.data;
};

const deleteAttendance = async (classId, date) => {
    const res = await axios.delete(`${API_URL}/classes/${classId}/attendance/${date}`, { withCredentials: true });
    return res.data;
};

const addStudentsToClass = async (classId, studentIds) => {
    const res = await axios.post(`${API_URL}/classes/${classId}/students`, { studentIds }, { withCredentials: true });
    return res.data;
};

const removeStudentFromClass = async (classId, studentId) => {
    const res = await axios.delete(`${API_URL}/classes/${classId}/students/${studentId}`, { withCredentials: true });
    return res.data;
};

const updateClass = async (classId, payload) => {
    const res = await axios.put(`${API_URL}/classes/${classId}`, payload, { withCredentials: true });
    return res.data;
};

const deleteClass = async (classId) => {
    const res = await axios.delete(`${API_URL}/classes/${classId}`, { withCredentials: true });
    return res.data;
};

//projects


const adminService = {
    getAllStudent, getStudentDetail, updateStudent, resetStudentPassword, createStudent,
    getAllTeacher, getTeacherDetail, updateTeacher, resetTeacherPassword, createTeacher, deleteTeacher,
    getAllClasses, getClassDetail, updateClass, createClass, deleteClass,
    addStudentsToClass, removeStudentFromClass, saveAttendance, deleteAttendance,
};
export default adminService;