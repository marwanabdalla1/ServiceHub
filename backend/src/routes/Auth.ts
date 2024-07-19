import express from "express";
import {login, logout, signup} from "../controller/utilityControllers/AuthController";
import {sendCreateAccountEmail} from "../controller/utilityControllers/EmailController";


const router = express.Router();
router.post('/signup/sendEmail', sendCreateAccountEmail);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;
