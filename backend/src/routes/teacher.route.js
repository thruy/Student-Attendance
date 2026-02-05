const express = require('express');
const route = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

route.get('/timetable', verifyToken, authorize('teacher'), teacherController.getTeacherTimetable);
route.get('/timetable/:classId/attendance', verifyToken, authorize('teacher'), teacherController.getAttendancePageData);
route.post('/timetable/attendance/save', verifyToken, authorize('teacher'), teacherController.saveAttendance);

route.get('/projects', verifyToken, authorize('teacher'), teacherController.getAllProjects);
route.get('/projects/:projectId', verifyToken, authorize('teacher'), teacherController.getProjectDetail);
route.put('/projects/:projectId/students/:studentId/report', verifyToken, authorize('teacher'), upload.single('file'), teacherController.uploadReport);
route.put('/projects/:projectId/students/:studentId/grade', verifyToken, authorize('teacher'), teacherController.gradeStudent);
route.put('/projects/:projectId/students/:studentId/title', verifyToken, authorize('teacher'), teacherController.updateTitleForStudent);

module.exports = route;