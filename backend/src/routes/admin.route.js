const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const classController = require('../controllers/class.controller');
const attendanceController = require('../controllers/attendance.controller');
const projectController = require('../controllers/project.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { editUserValidate, addUserValidate, createClassValidate, updateClassValidate } = require('../validation/adminValidate');

// mọi route admin đều cần đăng nhập với role admin
router.use(verifyToken, authorize('admin'));

//students
router.get('/students', userController.getAllUsers('student'));
router.get('/students/:id', userController.getUserDetail('student'));
router.put('/students/:id', editUserValidate, userController.updateUser('student'));
router.put('/students/:id/reset-password', userController.resetPassword);
router.post('/students', addUserValidate, userController.createUser('student'));
router.delete('/students/:id', userController.deleteStudent);

//teacher
router.get('/teachers', userController.getAllUsers('teacher'));
router.get('/teachers/:id', userController.getUserDetail('teacher'));
router.put('/teachers/:id', editUserValidate, userController.updateUser('teacher'));
router.put('/teachers/:id/reset-password', userController.resetPassword);
router.post('/teachers', addUserValidate, userController.createUser('teacher'));
router.delete('/teachers/:id', userController.deleteTeacher);

//class
router.get('/classes', classController.getAllClasses);
router.get('/classes/:classId', attendanceController.getClassAttendance);
router.post('/classes', createClassValidate, classController.createClass);
router.put('/classes/:classId', updateClassValidate, classController.updateClass);
router.delete('/classes/:classId', classController.deleteClass);
router.get('/classes/students/all', userController.getUsersForModal('student'));
router.get('/classes/teachers/all', userController.getUsersForModal('teacher'));
router.post('/classes/:classId/students', classController.addStudentsToClass);
router.delete('/classes/:classId/students/:studentId', classController.removeStudentFromClass);
router.post('/classes/:classId/attendance', attendanceController.saveAttendance);
router.delete('/classes/:classId/attendance/:date', attendanceController.deleteAttendance);

//project
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:projectId', projectController.getProjectDetail);
router.post('/projects', projectController.createProject);
router.put('/projects/:projectId', projectController.updateProjectInfo);
router.delete('/projects/:projectId', projectController.deleteProject);
router.get('/projects/students/all', userController.getUsersForModal('student'));
router.get('/projects/teachers/all', userController.getUsersForModal('teacher'));
router.post('/projects/:projectId/students', projectController.addStudentToProject);
router.delete('/projects/:projectId/students/:studentId', projectController.removeStudentFromProject);
router.put('/projects/:projectId/students/:studentId/report', projectController.uploadReport);
router.put('/projects/:projectId/students/:studentId/grade', projectController.gradeStudent);
router.put('/projects/:projectId/students/:studentId/title', projectController.updateTitleForStudent);

module.exports = router;
