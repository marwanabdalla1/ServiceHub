import express from "express";
import { signup } from "../controller/AccountController";


const router = express.Router();
router.post("/signup", signup);

export default router;