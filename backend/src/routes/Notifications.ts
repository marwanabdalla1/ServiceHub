import express from "express";
import { createNotification } from "../controller/NotificationController";
import { authenticate } from "../middleware/authenticate";


const NotificationRouter = express.Router();

NotificationRouter.post('/', authenticate, createNotification);

export default NotificationRouter;
