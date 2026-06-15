import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';

export function useAdminNotifications() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'Admin';
  
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!isAdmin) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Get latest 50 notifications

      if (fetchError) throw fetchError;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (isAdmin) {
      // Subscribe to real-time changes
      const channel = supabase
        .channel('admin-notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'admin_notifications',
          },
          (payload) => {
            console.log('Realtime Notification change:', payload);
            fetchNotifications(); // Refresh the list
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const markAsRead = async (id) => {
    try {
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Update local state to avoid full refetch
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (updateError) throw updateError;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
        const { error: deleteError } = await supabase
          .from('admin_notifications')
          .delete()
          .eq('id', id);
  
        if (deleteError) throw deleteError;
        
        setNotifications(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.is_read).length,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
}
