const express = require('express');
const route = express.Router();
const classController = require('../controllers/class.controller');
const attendanceController = require('../controllers/attendance.controller');
const projectController = require('../controllers/project.controller');
const examController = require('../controllers/exam.controller');
const examAttendanceController = require('../controllers/examAttendance.controller');
const { saveExamValidate } = require('../validation/examValidate');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// mọi route giảng viên đều cần đăng nhập với role teacher
route.use(verifyToken, authorize('teacher'));

route.get('/timetable', classController.getMyTimetable);
route.get('/timetable/:classId/attendance', attendanceController.getClassAttendance);
route.post('/timetable/attendance/save', attendanceController.saveAttendance);
route.post('/timetable/:classId/qr-session', attendanceController.startQrSession);
route.post('/timetable/:classId/qr-session/end', attendanceController.endQrSession);
route.get('/timetable/:classId/exam', examController.getClassExam);
route.put('/timetable/:classId/exam', saveExamValidate, examController.saveClassExam);
route.delete('/timetable/:classId/exam', examController.deleteClassExam);

// coi thi: cán bộ coi thi điểm danh, giảng viên của lớp chỉ xem
route.get('/exams', examController.getMyInvigilations);
route.get('/exams/:classId/rooms/:examCode/attendance', examAttendanceController.getRoomAttendance);
route.post('/exams/:classId/rooms/:examCode/attendance', examAttendanceController.saveRoomAttendance);
route.post('/exams/:classId/rooms/:examCode/qr-session', examAttendanceController.startRoomQrSession);
route.post('/exams/:classId/rooms/:examCode/qr-session/end', examAttendanceController.endRoomQrSession);

route.get('/projects', projectController.getAllProjects);
route.get('/projects/:projectId', projectController.getProjectDetail);
route.put('/projects/:projectId/students/:studentId/report', projectController.uploadReport);
route.put('/projects/:projectId/students/:studentId/grade', projectController.gradeStudent);
route.put('/projects/:projectId/students/:studentId/title', projectController.updateTitleForStudent);

module.exports = route;
