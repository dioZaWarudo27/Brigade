//tobelearned
import React, { useState, useEffect } from 'react';
import { getNotifications, type Notification } from '../api';
import { Layout } from './Dashboard';
import { Link } from 'react-router-dom';

const NotificationsPage = ({ onLogout }: { onLogout: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationMessage = (notif: Notification) => {
    switch (notif.type) {
      case 'follow':
        return 'started following you';
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your comment';
      default:
        return 'sent you a notification';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return <i className="fas fa-user-plus text-primary"></i>;
      case 'like': return <i className="fas fa-heart text-danger"></i>;
      case 'comment': return <i className="fas fa-comment text-success"></i>;
      case 'reply': return <i className="fas fa-reply text-info"></i>;
      default: return <i className="fas fa-bell"></i>;
    }
  };

  return (
    <Layout title="Notifications" onLogout={onLogout}>
      <div className="notifications-page">
        {loading ? (
          <div className="loading-state">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bell-slash"></i>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div key={notif.id} className={`notification-card ${notif.is_read ? '' : 'unread'}`}>
                <div className="notif-icon">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <p>
                    <strong>{notif.sender_name}</strong> {getNotificationMessage(notif)}
                  </p>
                  <span className="notif-time">
                    {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {notif.post_id ? (
                  <Link to={`/post/${notif.post_id}`} className="view-link">View Post</Link>
                ) : (
                  <Link to={`/user/${notif.sender_id}`} className="view-link">View Profile</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
