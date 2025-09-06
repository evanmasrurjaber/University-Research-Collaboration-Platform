import notificationModel from '../models/notificationModel.js';

// Create a new notification
export const createNotification = async (recipientId, type, message, projectId = null, fromUserId = null) => {
    try {
        const notification = new notificationModel({
            recipient: recipientId,
            type,
            message,
            project: projectId,
            fromUser: fromUserId
        });
        
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await notificationModel.find({ recipient: userId })
            .populate('fromUser', 'name profile.profilePhotoUrl')
            .populate('project', 'title')
            .sort({ createdAt: -1 })
            .limit(50);
            
        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const notification = await notificationModel.findById(id);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        
        // Ensure user owns this notification
        if (notification.recipient.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        
        notification.isRead = true;
        await notification.save();
        
        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await notificationModel.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
        
        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const count = await notificationModel.countDocuments({ 
            recipient: userId,
            isRead: false
        });
        
        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};