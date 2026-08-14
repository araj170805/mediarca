const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const clinicRoutes = require('./clinic.routes.js');
const doctorRoutes = require('./doctor.routes.js');
const appointmentWindowRoutes = require('./appointmentWindow.routes.js');
const appointmentRoutes = require('./appointment.routes.js');
const notificationRoutes = require('./notification.routes.js');
const qrCodeRoutes = require('./qrcode.routes.js');
const statsRoutes = require('./stats.routes.js');
const googleAuthRoutes = require('./googleAuth.routes.js');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clinics', clinicRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointment-windows', appointmentWindowRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/qrcodes', qrCodeRoutes);
router.use('/stats', statsRoutes);
router.use('/auth/google', googleAuthRoutes);

module.exports = router;
