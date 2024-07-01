import express from "express";
import {sendResetPasswordEmail, setNewPassword} from "../controller/EmailController";

const router = express.Router();
router.post('/resetPassword', sendResetPasswordEmail);
router.post('/setNewPassword', setNewPassword);

export default router;