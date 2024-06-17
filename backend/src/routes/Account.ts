import express from "express";
import {authenticate, deleteUser, login, logout, signup} from "../controller/AccountController";


const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/authenticate", authenticate);
router.post("/delete", deleteUser);

export default router;