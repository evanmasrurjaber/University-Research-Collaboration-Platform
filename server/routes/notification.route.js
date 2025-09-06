import express from 'express';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount
} from '../controllers/notification.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Get all notifications for current user
router.route('/').get(isAuthenticated, getUserNotifications);

// Get unread notification count
router.route('/unread-count').get(isAuthenticated, getUnreadCount);

// Mark notification as read
router.route('/:id/read').put(isAuthenticated, markNotificationAsRead);

// Mark all notifications as read
router.route('/mark-all-read').put(isAuthenticated, markAllNotificationsAsRead);

export default router;