const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrcode.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { authorizeRoles } = require('../middleware/role.middleware.js');
const verifyClinicAccess = require('../middleware/clinicAccess.middleware.js');

// Receptionist / Admin Generate QR Code
router.post('/generate', authMiddleware, authorizeRoles('admin', 'receptionist'), verifyClinicAccess, qrController.generateQRCode);

// Public Scan QR Code
router.get('/scan/:code', qrController.scanQRCode);

module.exports = router;
