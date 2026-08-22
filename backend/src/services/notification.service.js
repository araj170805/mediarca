const Notification = require('../models/Notification.model.js');
const ApiError = require('../utils/apiError.js');

class NotificationService {
  static async getUserNotifications(userId, { page = 1, limit = 20 }) {
    const query = { recipientId: userId };
    const skip = (Number(page) - 1) * Number(limit);
    

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('appointmentId')
        .populate('clinicId', 'name uniqueClinicId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipientId: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    return notification;
  }

  static async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    return { success: true, message: 'All notifications marked as read' };
  }
}

module.exports = NotificationService;
