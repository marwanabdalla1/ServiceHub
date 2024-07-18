import React, { useState, useEffect, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { IoNotificationsOutline } from 'react-icons/io5';
import { Notification } from '../../models/Notification'; // Import Notification interface
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth hook
import { useSocket } from '../../contexts/SocketContext'; // Import useSocket hook

interface NotificationBellProps {
  header?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ header }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token } = useAuth();
  const socket = useSocket();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const fetchNotifications = () => {
    if (token) {
      axios.get<Notification[]>('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          setNotifications(response.data);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  };

  const markAllNotificationsAsRead = () => {
    if (token) {
      // Update the local state first
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isViewed: true }))
      );

      // Then perform the API request
      axios.put('/api/notifications/mark-all-read', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        console.log('All notifications marked as read successfully.');
      })
      .catch(error => {
        console.error('Error marking all notifications as read:', error);
        // Optionally, revert the local state change if the request fails
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, isViewed: false }))
        );
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification: Notification) => {
        console.log('Received notification:', notification);
        setNotifications(prevNotifications => [notification, ...prevNotifications]);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationViewed = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification._id === id ? { ...notification, isViewed: true } : notification
      )
    );
  };

  const unreadNotificationsCount = notifications.filter(notification => !notification.isViewed).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="relative flex items-center justify-center">
        <IoNotificationsOutline className="h-6 w-6" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center rounded-full ring-2 ring-white bg-red-400 text-white text-xs" style={{ height: '0.75rem', width: '0.75rem', fontSize: '0.7rem' }}>
            {unreadNotificationsCount}
          </span>
        )}
      </button>
      {isOpen && (
        <NotificationDropdown
          data={notifications}
          header={header}
          onNotificationViewed={handleNotificationViewed}
          onMarkAllAsRead={markAllNotificationsAsRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
