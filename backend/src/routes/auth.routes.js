const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const requireDB = require('../middleware/requireDB.middleware.js');

// OTP routes (require DB)
router.post('/otp/send', requireDB, authController.sendOTP);
router.post('/otp/verify', requireDB, authController.verifyOTP);

// Signup routes (require DB)
router.post('/signup/patient', requireDB, authController.registerPatient);
router.post('/signup/receptionist', requireDB, authController.registerReceptionist);

// Login (require DB — except admin fallback handled in service layer)
router.post('/login', requireDB, authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.post('/set-password', authMiddleware, requireDB, authController.setPassword);

module.exports = router;
