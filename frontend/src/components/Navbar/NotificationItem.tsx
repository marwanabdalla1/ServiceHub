import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../models/Notification'; // Import Notification interface
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

interface NotificationItemProps extends Notification {
  markAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  _id,
  content,
  isViewed,
  updatedAt,
  markAsRead,
  NotificationType,
  review
}) => {
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  const navigate = useNavigate(); // useNavigate hook to navigate

  const handleClick = () => {
    // Define the URL based on NotificationType
    let url = '/';
    switch (NotificationType) {
      case 'New Review':
        url = `/customer_review/${review}`;
        break;
      // Add more cases here as needed
      default:
        url = '/';
    }

    // Redirect to the determined URL
    navigate(url);

    // Mark the notification as read
    if (!isViewed) {
      markAsRead(_id);
    }
  };

  return (
    <div
      className={`flex items-center p-2 border-b border-gray-200 cursor-pointer ${isViewed ? 'bg-gray-100' : 'bg-white'}`}
      onClick={handleClick} // Add click handler
    >
      <div className="flex-1">
        <div className="text-sm font-medium">{content}</div>
        <div className="text-xs text-gray-500">{timeAgo}</div>
      </div>
      {!isViewed && (
        <button
          className="text-blue-500 text-sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent onClick
            markAsRead(_id);
          }}
        >
          Mark as read
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
