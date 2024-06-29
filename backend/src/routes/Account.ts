import express from "express";
import { getProviderById, updateAccountDetails, deleteAccount, getAccountDetails, getRequesterById } from "../controller/AccountController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();
router.get('/providers/:providerId', getProviderById);
router.get('/requester/:requesterId', getRequesterById);
router.delete("/", authenticate, deleteAccount);
router.put('/', authenticate, updateAccountDetails);
router.get('/', authenticate, getAccountDetails);

export default router;