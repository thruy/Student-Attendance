const express = require('express');
const route = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

route.get('/timetable', verifyToken, studentController.getStudentTimetable);
route.get('/classes/:id/students', verifyToken, studentController.getInfoOfClasses);
route.get('/projects', verifyToken, studentController.getStudentProjects);
route.put('/projects/:projectId/students/:studentId/report', verifyToken, studentController.uploadReport);
route.get('/attendance/qr', verifyToken, authorize('student'), studentController.getQrSessionInfo);
route.post('/attendance/qr', verifyToken, authorize('student'), studentController.checkInByQr);

module.exports = route;