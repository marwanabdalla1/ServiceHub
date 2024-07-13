import React, { useState, useEffect, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { IoNotificationsOutline } from 'react-icons/io5';
import { Notification } from '../../models/Notification'; // Import Notification interface
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth hook

interface NotificationBellProps {
  header?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ header }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token } = useAuth();
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

  useEffect(() => {
    fetchNotifications();
  }, [token]);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="relative flex items-center justify-center">
        <IoNotificationsOutline className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-3 w-3 rounded-full ring-2 ring-white bg-red-400 text-white text-xs">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <NotificationDropdown
          data={notifications}
          header={header}
        />
      )}
    </div>
  );
};

export default NotificationBell;
