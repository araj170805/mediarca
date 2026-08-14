const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const NotificationService = require('../services/notification.service.js');

const getUserNotifications = asyncHandler(async (req, res) => {
  const data = await NotificationService.getUserNotifications(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Notifications retrieved successfully'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await NotificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, result, 'All notifications marked as read'));
});

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
