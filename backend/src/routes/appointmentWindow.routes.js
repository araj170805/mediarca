const express = require('express');
const router = express.Router();
const windowController = require('../controllers/appointmentWindow.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { authorizeRoles } = require('../middleware/role.middleware.js');
const verifyClinicAccess = require('../middleware/clinicAccess.middleware.js');

// Receptionist Endpoints
router.post('/', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, windowController.createWindow);
router.get('/clinic', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, windowController.getClinicWindows);
router.patch('/:id/status', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, windowController.updateWindowStatus);
router.put('/:id', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, windowController.updateWindow);

// Public / Patient Endpoint
router.get('/doctor/:doctorId', windowController.getDoctorWindows);

module.exports = router;
