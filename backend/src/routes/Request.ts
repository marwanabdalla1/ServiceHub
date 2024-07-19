import express from "express";
import {
    createServiceRequest,
    deleteRequest,
    getRequestById,
    getServiceRequestsByProvider,
    getServiceRequestsByRequester,
    handleChangeTimeslot,
    updateServiceRequest
} from "../controller/RequestController";
import {authenticate} from "../middleware/authenticate";


const router = express.Router();

router.post('/', authenticate, createServiceRequest);
router.post('/change-timeslots', authenticate, handleChangeTimeslot);

router.patch('/:requestId', authenticate, updateServiceRequest);
router.get('/:requestId', authenticate, getRequestById);

router.get('/provider/:providerId', authenticate, getServiceRequestsByProvider);
router.get('/requester/:requesterId', authenticate, getServiceRequestsByRequester);

router.delete('/:requestId', authenticate, deleteRequest);


export default router;
