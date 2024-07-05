import express from "express";
import { createNotification, getNotifications } from "../controller/NotificationController";
import { authenticate } from "../middleware/authenticate";


const NotificationRouter = express.Router();

NotificationRouter.post('/', authenticate, createNotification);
NotificationRouter.get('/', authenticate, getNotifications);

export default NotificationRouter;
