import express from "express";
import {
    createNotification,
    getNotifications,
    markAllNotificationsAsRead,
    updateNotification
} from "../controller/NotificationController";
import {authenticate} from "../middleware/authenticate";


const NotificationRouter = express.Router();

NotificationRouter.post('/', authenticate, createNotification);
NotificationRouter.get('/', authenticate, getNotifications);
NotificationRouter.patch("/:id", authenticate, updateNotification)
NotificationRouter.put('/mark-all-read', authenticate, markAllNotificationsAsRead); // Add new route


export default NotificationRouter;
