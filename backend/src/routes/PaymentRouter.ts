import express from "express";
import { signup, getProviderById, updateUserDetails, authenticate, deleteUser, login, logout } from "../controller/AccountController";
import { pay } from "../controller/PaymentController";

const router = express.Router();
router.post("stripe", pay)


export default router;