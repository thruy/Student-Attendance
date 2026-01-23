const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { editStudentValidate, addStudentValidate } = require('../validation/adminValidate');

router.get('/student', verifyToken, authorize('admin'), adminController.getAllStudents);
router.get('/student/:id', verifyToken, authorize('admin'), adminController.getStudentDetails);
router.put('/students/:id', verifyToken, authorize('admin'), adminController.updateStudent);
router.put('/students/:id/reset-password', verifyToken, authorize('admin'), editStudentValidate, adminController.resetPassword);
router.post('/students', verifyToken, authorize('admin'), addStudentValidate, adminController.createStudent);

module.exports = router;