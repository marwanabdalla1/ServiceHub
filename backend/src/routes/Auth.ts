import express from "express";
import {signup, logout, login} from "../controller/AuthController";
import {sendCreateAccountEmail, sendResetPasswordEmail} from "../controller/EmailController";


const router = express.Router();
router.post('/signup/sendEmail', sendCreateAccountEmail);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;
