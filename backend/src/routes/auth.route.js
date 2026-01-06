const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { registerValidate, loginValidate } = require('../validation/validate')

router.post('/register', registerValidate, authController.register)
router.post('/login', loginValidate, authController.login)
router.get('/verify', verifyToken, authController.verify)
router.post('/logout', authController.logout)
router.get('/profile', verifyToken, authController.getInfo)

module.exports = router