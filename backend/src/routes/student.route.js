const express = require('express');
const route = express.Router();
const classController = require('../controllers/class.controller');
const attendanceController = require('../controllers/attendance.controller');
const projectController = require('../controllers/project.controller');
const examController = require('../controllers/exam.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// mọi route sinh viên đều cần đăng nhập với role student
route.use(verifyToken, authorize('student'));

route.get('/timetable', classController.getMyTimetable);
route.get('/classes/:id/students', classController.getClassInfo);
route.get('/projects', projectController.getMyProjects);
route.put('/projects/:projectId/students/:studentId/report', projectController.uploadReport);
route.get('/attendance/qr', attendanceController.getQrSessionInfo);
route.post('/attendance/qr', attendanceController.checkInByQr);
route.get('/exams', examController.getMyExams);

module.exports = route;
