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

const deleteStudent = async (studentId) => {
    const res = await axios.delete(`${API_URL}/students/${studentId}`, { withCredentials: true });
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

const getStudentsForClassModal = async (search = '') => {
    const res = await axios.get(`${API_URL}/classes/students/all`, { params: { search }, withCredentials: true });
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
const createProject = async (data) => {
    const response = await axios.post(`${API_URL}/projects`, data, { withCredentials: true });
    return response.data;
};

const getStudentsForProjectModal = async (search = '') => {
    const res = await axios.get(`${API_URL}/projects/students/all`, { params: { search }, withCredentials: true });
    return res.data;
};

const getTeachersForProjectModal = async (search = '') => {
    const res = await axios.get(`${API_URL}/projects/teachers/all`, { params: { search }, withCredentials: true });
    return res.data;
};

const addStudentToProject = async (projectId, studentId) => {
    const response = await axios.post(`${API_URL}/projects/${projectId}/students`, { studentId }, { withCredentials: true });
    return response.data;
};

const removeStudentFromProject = async (projectId, studentId) => {
    const response = await axios.delete(`${API_URL}/projects/${projectId}/students/${studentId}`, { withCredentials: true });
    return response.data;
};

const getAllProjects = async ({ page, limit, search, semester }) => {
    const res = await axios.get(`${API_URL}/projects`, { params: { page, limit, search, semester }, withCredentials: true });
    return res.data;
};

const getProjectDetail = async (projectId) => {
    const res = await axios.get(`${API_URL}/projects/${projectId}`, { withCredentials: true });
    return res.data;
};

const updateProjectInfo = async (projectId, payload) => {
    const res = await axios.put(`${API_URL}/projects/${projectId}`, payload, { withCredentials: true });
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

const deleteProject = async (projectId) => {
    const response = await axios.delete(`${API_URL}/projects/${projectId}`, { withCredentials: true });
    return response.data;
};

const adminService = {
    getAllStudent, getStudentDetail, updateStudent, resetStudentPassword, createStudent, deleteStudent,
    getAllTeacher, getTeacherDetail, updateTeacher, resetTeacherPassword, createTeacher, deleteTeacher,

    getAllClasses, getClassDetail, createClass, updateClass, deleteClass,
    getStudentsForClassModal, addStudentsToClass, removeStudentFromClass, saveAttendance, deleteAttendance,

    getAllProjects, getProjectDetail, createProject, updateProjectInfo, deleteProject,
    getStudentsForProjectModal, getTeachersForProjectModal, addStudentToProject, removeStudentFromProject,
    uploadReport, gradeStudent, updateTitleForStudent
};
export default adminService;