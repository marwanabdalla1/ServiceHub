import express from "express";
import { createNotification, getNotifications, updateNotification } from "../controller/NotificationController";
import { authenticate } from "../middleware/authenticate";


const NotificationRouter = express.Router();

NotificationRouter.post('/', authenticate, createNotification);
NotificationRouter.get('/', authenticate, getNotifications);
NotificationRouter.patch("/:id", authenticate, updateNotification)


export default NotificationRouter;
