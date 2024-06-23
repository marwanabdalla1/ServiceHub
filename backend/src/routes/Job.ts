import express from "express";
import { createJob, getJobsByProvider } from "../controller/JobController";
import {authenticate} from "../middleware/authenticate";


const router = express.Router();

router.post('/', authenticate, createJob);
router.get("/provider/:providerId", authenticate, getJobsByProvider)

export default router;
