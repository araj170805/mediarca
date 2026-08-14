const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { authorizeRoles } = require('../middleware/role.middleware.js');

// Patient Profile & Family Members
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/family-members', authMiddleware, authorizeRoles('patient'), userController.addFamilyMember);
router.put('/family-members/:memberId', authMiddleware, authorizeRoles('patient'), userController.updateFamilyMember);
router.delete('/family-members/:memberId', authMiddleware, authorizeRoles('patient'), userController.deleteFamilyMember);

// Admin User Management
router.get('/', authMiddleware, authorizeRoles('admin'), userController.getAllUsers);
router.get('/:id', authMiddleware, authorizeRoles('admin'), userController.getUserById);
router.put('/:id/block', authMiddleware, authorizeRoles('admin'), userController.blockUser);
router.put('/:id/unblock', authMiddleware, authorizeRoles('admin'), userController.unblockUser);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), userController.deleteUser);

module.exports = router;
