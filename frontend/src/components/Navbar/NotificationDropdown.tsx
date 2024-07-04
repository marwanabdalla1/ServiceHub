import React from 'react';
import NotificationItem from './NotificationItem';
import { Notification } from '../../models/Notification'; // Import Notification interface

interface NotificationDropdownProps {
  data: Notification[];
  markAsRead: (id: string) => void;
  header?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  data,
  markAsRead,
  header = 'Notifications',
}) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">{header}</h3>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {data.map(notification => (
          <NotificationItem
            key={notification?.id}
            {...notification}
            markAsRead={markAsRead}
          />
        ))}
      </div>
      {data.length === 0 && (
        <div className="p-4 text-center text-gray-500">No notifications</div>
      )}
    </div>
  );
};

export default NotificationDropdown;
