const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { authorizeRoles } = require('../middleware/role.middleware.js');
const verifyClinicAccess = require('../middleware/clinicAccess.middleware.js');

// Receptionist Endpoints
router.post('/', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, doctorController.addDoctor);
router.put('/:id', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, doctorController.updateDoctor);
router.patch('/:id/status', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, doctorController.toggleDoctorStatus);
router.get('/clinic/my-doctors', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, doctorController.getDoctorsByClinic);

// Public & Patient Endpoints
router.get('/', doctorController.searchDoctors);
router.get('/:id', doctorController.getDoctorProfile);

module.exports = router;
