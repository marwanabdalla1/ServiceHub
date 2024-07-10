import express from "express";
import {
    createServiceRequest,
    getServiceRequestsByProvider,
    // getIncomingServiceRequestsByProvider,
    getServiceRequestsByRequester,
    updateServiceRequest, handleChangeTimeslot, getRequestById,
    // cleanUpServiceRequests
} from "../controller/RequestController";
import { authenticate } from "../middleware/authenticate";


const router = express.Router();

router.post('/', authenticate, createServiceRequest);
router.post('/change-timeslots', authenticate, handleChangeTimeslot);

router.patch('/:requestId', authenticate, updateServiceRequest);
router.get('/:requestId', authenticate, getRequestById);

router.get('/provider/:providerId', authenticate, getServiceRequestsByProvider);
// router.get('/provider/incoming/:providerId', authenticate, getIncomingServiceRequestsByProvider);
router.get('/requester/:requesterId', authenticate, getServiceRequestsByRequester);

// router.delete('/cleanup-service-requests', cleanUpServiceRequests);

export default router;
