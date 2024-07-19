// src/utils/notificationUtils.js
import {io} from '../app';

/**
 * Emit a notification to a user
 * @param userId
 * @param notification
 */
export const emitNotification = (userId: any, notification: any) => {
    console.log(`Emitting notification to user ${userId}:`, notification); // Add this line
    io.to(userId).emit('notification', notification);
};
