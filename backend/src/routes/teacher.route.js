const express = require('express');
const route = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { verifyToken } = require('../middleware/auth.middleware');

route.get('/timetable', verifyToken, teacherController.getTeacherTimetable);

module.exports = route;