const express = require('express');
const route = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

route.get('/timetable', verifyToken, authorize('teacher'), teacherController.getTeacherTimetable);
route.get('/timetable/:classId/attendance', verifyToken, authorize('teacher'), teacherController.getAttendancePageData);
route.post('timetable/:classId/attendance/create', verifyToken, authorize('teacher', teacherController.createAttendanceSession));

module.exports = route;