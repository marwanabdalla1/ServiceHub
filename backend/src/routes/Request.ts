import express from "express";
import {
    createServiceRequest,
    getServiceRequestsByProvider,
    updateServiceRequest
} from "../controller/RequestController";
import {authenticate} from "../middleware/authenticate";


const router = express.Router();

router.post('/', authenticate, createServiceRequest);
router.patch('/:requestId', authenticate, updateServiceRequest);
router.get('/provider/:providerId', authenticate, getServiceRequestsByProvider);


export default router;
