const express = require('express');
const router = express.Router();
const apptController = require('../controllers/appointment.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { authorizeRoles } = require('../middleware/role.middleware.js');
const verifyClinicAccess = require('../middleware/clinicAccess.middleware.js');

// Patient Endpoints
router.post('/', authMiddleware, authorizeRoles('patient'), apptController.bookAppointment);
router.get('/my-appointments', authMiddleware, authorizeRoles('patient'), apptController.getPatientAppointments);
router.put('/:id/cancel', authMiddleware, apptController.cancelAppointment);

// Receptionist Endpoints
router.get('/clinic', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, apptController.getClinicAppointments);
router.put('/:id/confirm', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, apptController.confirmAppointment);
router.put('/:id/reject', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, apptController.rejectAppointment);
router.put('/:id/complete', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, apptController.completeAppointment);
router.get('/patient-history/:patientId', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, apptController.getPatientHistoryForClinic);

// Admin Endpoints
router.get('/admin', authMiddleware, authorizeRoles('admin'), apptController.getAdminAppointments);

module.exports = router;
