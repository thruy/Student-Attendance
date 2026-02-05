const express = require('express');
const route = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth.middleware');

route.get('/timetable', verifyToken, studentController.getStudentTimetable);
route.get('/classes/:id/students', verifyToken, studentController.getInfoOfClasses);
route.get('/projects', verifyToken, studentController.getStudentProjects);
route.put('/projects/:projectId/students/:studentId/report', verifyToken, upload.single('file'), studentController.uploadReport);

module.exports = route;