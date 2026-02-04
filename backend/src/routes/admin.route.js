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

//teacher
router.get('/teachers', verifyToken, authorize('admin'), adminController.getAllTeachers);
router.get('/teachers/:id', verifyToken, authorize('admin'), adminController.getTeacherDetails);
router.put('/teachers/:id', verifyToken, authorize('admin'), editUserValidate, adminController.updateTeacher);
router.put('/teachers/:id/reset-password', verifyToken, authorize('admin'), adminController.resetPassword);
router.post('/teachers', verifyToken, authorize('admin'), addUserValidate, adminController.createTeacher);
router.delete('/teachers/:id', verifyToken, authorize('admin'), adminController.deleteTeacher);

//class
router.get('/classes', verifyToken, authorize('admin'), adminController.getAllClasses);
router.get('/classes/:id', verifyToken, authorize('admin'), adminController.getClassDetail);
router.post('/classes/:id/attendance', verifyToken, authorize('admin'), adminController.saveAttendance);
router.delete('/classes/:classId/attendance/:date', verifyToken, authorize('admin'), adminController.deleteAttendance);
router.post('/classes', verifyToken, authorize('admin'), createClassValidate, adminController.createClass);
router.post('/classes/:classId/students', verifyToken, authorize('admin'), adminController.addStudentsToClass);
router.delete('/classes/:classId/students/:studentId', verifyToken, authorize('admin'), adminController.removeStudentFromClass);
router.put('/classes/:classId', verifyToken, authorize('admin'), updateClassValidate, adminController.updateClass);
router.delete('/classes/:id', verifyToken, authorize('admin'), adminController.deleteClass);

//project
router.post('/projects', verifyToken, authorize('admin'), adminController.createProject);
router.post('/:projectId/students', verifyToken, authorize('admin'), adminController.addStudentToProject);
router.delete('/:projectId/students/:studentId', verifyToken, authorize('admin'), adminController.removeStudentFromProject);

module.exports = router;