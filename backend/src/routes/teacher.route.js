const express = require('express');
const route = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

route.get('/timetable', verifyToken, authorize('teacher'), teacherController.getTeacherTimetable);

module.exports = route;