import React from 'react';
import NotificationItem from './NotificationItem';
import { Notification } from '../../models/Notification'; // Import Notification interface

interface NotificationDropdownProps {
  data: Notification[];
  header?: string;
  onNotificationViewed: (id: string) => void;
  onMarkAllAsRead: () => void; // New prop forf marking all as read
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  data,
  header = 'Notifications',
  onNotificationViewed,
  onMarkAllAsRead,
}) => {
  return (
    <div className="relative group">
      <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg">
        <div className="p-4 border-b border-gray-200 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold">{header}</h3>
          <button
            onClick={onMarkAllAsRead}
            className=" group-hover:opacity-100 text-blue-400 hover:bg-gray-100 px-4 py-2 rounded transition-opacity duration-300"
          >
            Mark all as read
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto rounded-b-lg">
          {data.map(notification => (
            <NotificationItem
              key={notification._id}
              {...notification}
              onNotificationViewed={onNotificationViewed}
            />
          ))}
        </div>
        {data.length === 0 && (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
