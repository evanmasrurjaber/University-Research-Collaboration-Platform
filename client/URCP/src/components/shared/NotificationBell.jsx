import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';

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

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate to the appropriate page based on notification type
    if (notification.project) {
      navigate(`/project/${notification.project._id}`);
    }
    
    setIsOpen(false);
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

  const formatTime = (date) => {
    return formatTimeAgo(date);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={handleToggleDropdown}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-3 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="text-xl mt-1">{getNotificationTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="text-sm">{notification.message}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 py-1"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;