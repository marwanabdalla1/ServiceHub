import { Router } from 'express';
import { getProviderById, getServiceOfferingById } from '../controller/booking';

const router = Router();

// Account routes
// router.get('/accounts/:id', getAccountById);
router.get('/provider/:providerId', getProviderById);

// router.put('/accounts/:id', updateAccount);

// Service Offering routes
router.get('/provider/:providerId/offering/:offeringId', getServiceOfferingById);
// router.get('/offering/:id', getServiceOfferingById);
// router.get('/serviceOfferings', listServiceOfferings);

export default router;
