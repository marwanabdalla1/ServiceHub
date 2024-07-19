import express from "express";
import {createJob, getJobById, getJobsByProvider, getJobsByRequester, updateJob,} from "../controller/JobController";
import {authenticate} from "../middleware/authenticate";


const router = express.Router();

router.post('/', authenticate, createJob);
router.get("/provider/:providerId", authenticate, getJobsByProvider)
router.get("/requester/:requesterId", authenticate, getJobsByRequester)
router.get("/:jobId", authenticate, getJobById)
router.put("/:jobId", authenticate, updateJob)


export default router;
