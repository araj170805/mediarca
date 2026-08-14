const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.use(authMiddleware);

router.get('/', notifController.getUserNotifications);
router.patch('/read-all', notifController.markAllAsRead);
router.patch('/:id/read', notifController.markAsRead);

module.exports = router;
