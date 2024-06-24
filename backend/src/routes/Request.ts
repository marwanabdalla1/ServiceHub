import express from "express";
import {
    createServiceRequest,
    getServiceRequestsByProvider,
    getIncomingServiceRequestsByProvider,
    getServiceRequestsByRequester,
    updateServiceRequest
} from "../controller/RequestController";
import { authenticate } from "../middleware/authenticate";


const router = express.Router();

router.post('/', authenticate, createServiceRequest);
router.put('/:requestId', authenticate, updateServiceRequest);
router.get('/provider/:providerId', authenticate, getServiceRequestsByProvider);
router.get('/provider/incoming/:providerId', authenticate, getIncomingServiceRequestsByProvider);
router.get('/requester/:requesterId', authenticate, getServiceRequestsByRequester);

export default router;
