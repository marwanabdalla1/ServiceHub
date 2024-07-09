import express from "express";
import { sendCancellationEmails } from "../controller/EmailController";

const router = express.Router();
router.post('/cancelNotification', sendCancellationEmails);

export default router;