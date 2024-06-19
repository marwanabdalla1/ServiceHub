import express from "express";
import { signup, getProviderById, updateUserDetails } from "../controller/AccountController";


const router = express.Router();
router.post("/signup", signup);

router.get('/providers/:providerId', getProviderById);

router.put('/accounts/:id', updateUserDetails);


export default router;