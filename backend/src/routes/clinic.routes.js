const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { authorizeRoles } = require('../middleware/role.middleware.js');
const verifyClinicAccess = require('../middleware/clinicAccess.middleware.js');

// Admin Endpoints
router.post('/', authMiddleware, authorizeRoles('admin'), clinicController.createClinic);
router.get('/admin', authMiddleware, authorizeRoles('admin'), clinicController.getClinicsForAdmin);
router.put('/:id/status', authMiddleware, authorizeRoles('admin'), clinicController.updateClinicStatus);

// Receptionist Endpoint
router.put('/my-clinic', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, clinicController.updateOwnClinic);

// Public / Patient Endpoints
router.get('/', clinicController.getClinicsPublic);
router.get('/:id', clinicController.getClinicById);

module.exports = router;
