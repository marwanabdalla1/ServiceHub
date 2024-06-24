import express from "express";
import { createJob, getJobsByProvider, getJobsByRequester, updateJob } from "../controller/JobController";
import { authenticate } from "../middleware/authenticate";


const router = express.Router();

router.post('/', authenticate, createJob);
router.get("/provider/:providerId", authenticate, getJobsByProvider)
router.get("/requester/:requesterId", authenticate, getJobsByRequester)
router.put("/:jobId", authenticate, updateJob)

export default router;
