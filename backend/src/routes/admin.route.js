const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { editUserValidate, addUserValidate, createClassValidate, updateClassValidate } = require('../validation/adminValidate');

//students
router.get('/students', verifyToken, authorize('admin'), adminController.getAllStudents);
router.get('/students/:id', verifyToken, authorize('admin'), adminController.getStudentDetails);
router.put('/students/:id', verifyToken, authorize('admin'), editUserValidate, adminController.updateStudent);
router.put('/students/:id/reset-password', verifyToken, authorize('admin'), adminController.resetPassword);
router.post('/students', verifyToken, authorize('admin'), addUserValidate, adminController.createStudent);
router.delete('/students/:id', verifyToken, authorize('admin'), adminController.deleteStudent)

//teacher
router.get('/teachers', verifyToken, authorize('admin'), adminController.getAllTeachers);
router.get('/teachers/:id', verifyToken, authorize('admin'), adminController.getTeacherDetails);
router.put('/teachers/:id', verifyToken, authorize('admin'), editUserValidate, adminController.updateTeacher);
router.put('/teachers/:id/reset-password', verifyToken, authorize('admin'), adminController.resetPassword);
router.post('/teachers', verifyToken, authorize('admin'), addUserValidate, adminController.createTeacher);
router.delete('/teachers/:id', verifyToken, authorize('admin'), adminController.deleteTeacher);

//class
router.get('/classes', verifyToken, authorize('admin'), adminController.getAllClasses);
router.get('/classes/:classId', verifyToken, authorize('admin'), adminController.getClassDetail);
router.post('/classes', verifyToken, authorize('admin'), createClassValidate, adminController.createClass);
router.put('/classes/:classId', verifyToken, authorize('admin'), updateClassValidate, adminController.updateClass);
router.delete('/classes/:classId', verifyToken, authorize('admin'), adminController.deleteClass);
router.post('/classes/:classId/students', verifyToken, authorize('admin'), adminController.addStudentsToClass);
router.delete('/classes/:classId/students/:studentId', verifyToken, authorize('admin'), adminController.removeStudentFromClass);
router.post('/classes/:classId/attendance', verifyToken, authorize('admin'), adminController.saveAttendance);
router.delete('/classes/:classId/attendance/:date', verifyToken, authorize('admin'), adminController.deleteAttendance);

//project
router.get('/projects', verifyToken, authorize('admin'), adminController.getAllProjects);
router.get('/projects/:projectId', verifyToken, authorize('admin'), adminController.getProjectDetail);
router.post('/projects', verifyToken, authorize('admin'), adminController.createProject);
router.put('/projects/:projectId', verifyToken, authorize('admin'), adminController.updateProjectInfo);
router.delete('/projects/:projectId', verifyToken, authorize('admin'), adminController.deleteProject);
router.post('/projects/:projectId/students', verifyToken, authorize('admin'), adminController.addStudentToProject);
router.delete('/projects/:projectId/students/:studentId', verifyToken, authorize('admin'), adminController.removeStudentFromProject);
router.put('/projects/:projectId/students/:studentId/report', verifyToken, authorize('admin'), adminController.uploadReport);
router.put('/projects/:projectId/students/:studentId/grade', verifyToken, authorize('admin'), adminController.gradeStudent);
router.put('/projects/:projectId/students/:studentId/title', verifyToken, authorize('admin'), adminController.updateTitleForStudent);

module.exports = router;