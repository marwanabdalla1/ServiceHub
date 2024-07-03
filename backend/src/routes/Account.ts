import express from "express";
import { getAccountById, getProviderById, updateAccountDetails, deleteAccount, getAccountDetails, getRequesterById, getNameById } from "../controller/AccountController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();
router.get('/:id', authenticate, getAccountById);
router.get('/providers/:providerId', authenticate, getProviderById);
router.get('/requester/:requesterId', authenticate, getRequesterById);
router.delete("/", authenticate, deleteAccount);
router.put('/', authenticate, updateAccountDetails);
router.get('/', authenticate, getAccountDetails);
router.get('/name/:userId', authenticate, getNameById);

export default router;