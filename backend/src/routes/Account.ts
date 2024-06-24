import express from "express";
import { getProviderById, updateAccountDetails, deleteAccount, getAccountDetails } from "../controller/AccountController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();
router.get('/providers/:providerId', getProviderById);
router.delete("/", authenticate, deleteAccount);
router.put('/', authenticate, updateAccountDetails);
router.get('/', authenticate, getAccountDetails);

export default router;