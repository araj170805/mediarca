const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { authorizeRoles } = require('../middleware/role.middleware.js');
const verifyClinicAccess = require('../middleware/clinicAccess.middleware.js');

router.get('/admin', authMiddleware, authorizeRoles('admin'), statsController.getAdminStats);
router.get('/receptionist', authMiddleware, authorizeRoles('receptionist'), verifyClinicAccess, statsController.getReceptionistStats);

module.exports = router;
