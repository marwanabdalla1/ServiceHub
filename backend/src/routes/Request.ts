import express from "express";
import { createServiceRequest } from "../controller/RequestController";


const router = express.Router();

router.post('/new-service-request', createServiceRequest);

export default router;
