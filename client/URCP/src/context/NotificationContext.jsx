import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { NOTIFICATION_API_END_POINT } from '@/utils/constant';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Memoize the functions with useCallback to prevent infinite loops
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${NOTIFICATION_API_END_POINT}`, { withCredentials: true });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${NOTIFICATION_API_END_POINT}/unread-count`, { withCredentials: true });
      
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axios.put(
        `${NOTIFICATION_API_END_POINT}/${notificationId}/read`, 
        {}, 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Update the notification in state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axios.put(
        `${NOTIFICATION_API_END_POINT}/mark-all-read`, 
        {}, 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Update all notifications in state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
        
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Set up interval to check for new notifications
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};