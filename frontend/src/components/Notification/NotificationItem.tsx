import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../models/Notification'; // Import Notification interface
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext"; // Import useNavigate for navigation
import axios from 'axios'; // Import axios for making API calls

interface NotificationItemProps extends Notification {
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  _id,
  content,
  isViewed: initialIsViewed,
  updatedAt,
  notificationType,
  review,
  job,
  serviceRequest,
}) => {
  const [isViewed, setIsViewed] = useState(initialIsViewed); // Local state for isViewed
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  const navigate = useNavigate(); // useNavigate hook to navigate
  const { token } = useAuth(); // useAuth hook to get the token

  const updateNotificationStatus = async () => {
    try {
      const response = await axios.patch(
        `/api/notifications/${_id}`,
        { isViewed: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Notification status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification status', error);
      return null;
    }
  };

  const handleClick = async () => {
    setIsViewed(true); // Update local state immediately
    const updatedNotification = await updateNotificationStatus();
    if (updatedNotification) {
      // Define the URL based on NotificationType
      let url = '/';
      switch (notificationType) {
        case 'New Review':
          url = `/customer_review/${review}`;
          break;
        case 'Updated Review':
          url = `/customer_review/${review}`;
          break;
        case 'New Job':
          url = `/incoming/jobs/${job}`;
          break;
        case 'New Request':
          url = `/incoming/requests/${serviceRequest}`;
          break;
        case 'Request Status Changed':
          url = `/requests/${serviceRequest}`;
          break;
        case 'Job Status Changed':
          url = `/jobs/${job}`;
          break;
        // Add more cases here as needed
        case 'Timeslot Change Request':
          let commentFromProvider = '';
          const commentMatch = content.match(/Comment from the provider: (.*)$/);
          if (commentMatch && commentMatch[1]) {
            commentFromProvider = encodeURIComponent(commentMatch[1]);
          }
          url = `/change-booking-time/${serviceRequest}?comment=${encodeURIComponent(content)}`;
          break;
        case 'Request Time Has Changed':
          url = `/incoming/requests/${serviceRequest}`;
          break;
        default:
          url = '/';
      }
      navigate(url);
    } else {
      console.error('Notification update failed, navigation cancelled');
    }
  };

  return (
    <div
      className={`flex items-center p-2 border-b border-gray-200 cursor-pointer ${
        isViewed ? 'bg-gray-100' : 'bg-slate-200 font-bold'
      }`}
      onClick={handleClick} // Add click handler
    >
      <div className="flex-1">
        <div className={`text-sm ${isViewed ? 'font-medium' : 'font-bold'}`}>{content}</div>
        <div className="text-xs text-gray-500">{timeAgo}</div>
      </div>
    </div>
  );
};

export default NotificationItem;
