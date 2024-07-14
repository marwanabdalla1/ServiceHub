import express from "express";
import { sendCancellationEmails, sendRequestConfirmationEmail } from "../controller/EmailController";

const router = express.Router();
router.post('/cancelNotification', sendCancellationEmails);
router.post('/requestConfirmation', sendRequestConfirmationEmail);

export default router;