import express from "express";
import { signup, getProviderById, updateUserDetails, authenticate, deleteUser, login, logout, signup } from "../controller/AccountController";


const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/authenticate", authenticate);
router.post("/delete", deleteUser);

router.get('/providers/:providerId', getProviderById);

router.put('/accounts/:id', updateUserDetails);


export default router;