import express from "express";
import { createNotification } from "../controller/NotificationController";
import { authenticate } from "../middleware/authenticate";


const NotificationsRouter = express.Router();

NotificationsRouter.post('/', authenticate, createNotification);

export default NotificationsRouter;
