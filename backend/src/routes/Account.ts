import express from "express";
import { getAccountById, getProviderById, updateAccountDetails, deleteAccount, getAccountDetails, getRequesterById } from "../controller/AccountController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();
router.get('/:id', getAccountById);
router.get('/providers/:providerId', getProviderById);
router.get('/requester/:requesterId', getRequesterById);
router.delete("/", authenticate, deleteAccount);
router.put('/', authenticate, updateAccountDetails);
router.get('/', authenticate, getAccountDetails);

export default router;