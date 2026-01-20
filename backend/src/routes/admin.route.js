const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/student', verifyToken, roleMiddleware('admin'), getAllStudents);

module.exports = router;