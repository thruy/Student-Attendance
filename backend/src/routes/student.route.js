const express = require('express');
const route = require('express').Router();
const studentController = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth.middleware');

route.get('/timetable', verifyToken, studentController.getStudentTimetable);

module.exports = route;