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
import {authenticate, isAdmin} from "../middleware/authenticate";

const router = express.Router();
router.get('/:id', authenticate, getAccountById);
router.get('/providers/:providerId', getProviderById);
router.get('/requester/:requesterId', authenticate, getRequesterById);
router.delete("/", authenticate, deleteAccount);
router.put('/', authenticate, updateAccountDetails);
router.get('/', authenticate, getAccountDetails);
router.get('/admin/userdata', authenticate, isAdmin, adminUserData);
router.delete('/admin/userdata/:id', authenticate, isAdmin, deleteAccount);

export default router;