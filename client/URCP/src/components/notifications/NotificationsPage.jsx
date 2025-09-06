import React, { useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';
import Navigationbar from '../shared/Navigationbar';
// Remove this line: import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Add this helper function
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  
  if (secondsAgo < 60) {
    return 'just now';
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 2592000) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 31536000) {
    const months = Math.floor(secondsAgo / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(secondsAgo / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

const NotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate to the appropriate page
    if (notification.project) {
      navigate(`/project/${notification.project._id}`);
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'project_approved':
        return '✅';
      case 'role_request_approved':
        return '👍';
      case 'role_request_rejected':
        return '👎';
      case 'new_role_request':
        return '🙋';
      case 'new_comment':
      case 'new_reply':
        return '💬';
      case 'project_update':
        return '🔄';
      case 'project_completed':
        return '🎉';
      default:
        return '📝';
    }
  };

  // Replace this function
  const formatTime = (date) => {
    return formatTimeAgo(date);
  };

  const getNotificationTypeTitle = (type) => {
    switch (type) {
      case 'project_approved':
        return 'Project Approved';
      case 'role_request_approved':
        return 'Role Request Approved';
      case 'role_request_rejected':
        return 'Role Request Declined';
      case 'new_role_request':
        return 'New Role Request';
      case 'new_comment':
        return 'New Comment';
      case 'new_reply':
        return 'New Reply';
      case 'project_update':
        return 'Project Updated';
      case 'project_completed':
        return 'Project Completed';
      default:
        return 'Notification';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigationbar />
      
      <div className="max-w-4xl mx-auto mt-28 px-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Notifications</h2>
          
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            className="text-sm"
          >
            Mark all as read
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900' : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getNotificationTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-gray-500 dark:text-gray-400">
                        {getNotificationTypeTitle(notification.type)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1">{notification.message}</p>
                    
                    {notification.project && (
                      <div className="mt-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                          Project: {notification.project.title}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No notifications</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              You don't have any notifications yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;