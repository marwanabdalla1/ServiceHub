import express from "express";
import { sendCancellationNotificationEmail } from "../controller/EmailController";

const router = express.Router();
router.post('/cancelNotification', sendCancellationNotificationEmail);

export default router;