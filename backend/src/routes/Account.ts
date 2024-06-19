import express from "express";
import { signup, getProviderById } from "../controller/AccountController";


const router = express.Router();
router.post("/signup", signup);

router.get('/provider/:providerId', getProviderById);

export default router;