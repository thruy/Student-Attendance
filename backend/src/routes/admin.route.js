const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { editUserValidate, addUserValidate } = require('../validation/adminValidate');

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
module.exports = router;