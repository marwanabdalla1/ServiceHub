import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../models/Notification'; // Import Notification interface

interface NotificationItemProps extends Notification {
  markAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  _id,
  content,
  isViewed,
  updatedAt,
  markAsRead,
  NotificationType
}) => {
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

  return (
    <div className={`flex items-center p-2 border-b border-gray-200 ${isViewed ? 'bg-gray-100' : 'bg-white'}`}>
      <div className="flex-1">
        <div className="text-sm font-medium">{content}</div>
        <div className="text-xs text-gray-500">{timeAgo}</div>
      </div>
      {!isViewed && (
        <button
          className="text-blue-500 text-sm"
          onClick={() => markAsRead(_id)}
        >
          Mark as read
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
