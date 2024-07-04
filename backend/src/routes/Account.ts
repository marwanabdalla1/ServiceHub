import express from "express";
import {
    getProviderById,
    updateAccountDetails,
    deleteAccount,
    getAccountDetails,
    adminUserData,
    getAccountById,
    getRequesterById
} from "../controller/AccountController";
import {authenticate} from "../middleware/authenticate";

const router = express.Router();
router.get('/:id', authenticate, getAccountById);
router.get('/providers/:providerId', getProviderById);
router.get('/requester/:requesterId', authenticate, getRequesterById);
router.delete("/", authenticate, deleteAccount);
router.put('/', authenticate, updateAccountDetails);
router.get('/', authenticate, getAccountDetails);
router.get('/admin/userdata', authenticate, adminUserData);

export default router;