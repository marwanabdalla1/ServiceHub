import express from "express";
import {signup} from "../controller/auth";

const router = express.Router();
router.post("/signup", signup);

export default router;