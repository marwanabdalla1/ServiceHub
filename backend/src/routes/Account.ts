import express from "express";
import {
    adminUserData,
    deleteAccount,
    getAccountById,
    getAccountDetails,
    getProviderById,
    getRequesterById,
    updateAccountDetails,
    updateAccountDetailsByAdmin
} from "../controller/utilityControllers/AccountController";
import {authenticate, isAdmin} from "../middleware/authenticate";

const router = express.Router();
router.get('/:id', authenticate, getAccountById);
router.get('/providers/:providerId', getProviderById);
router.get('/requester/:requesterId', authenticate, getRequesterById);
router.delete("/", authenticate, deleteAccount);
router.put('/', authenticate, updateAccountDetails);
router.get('/', authenticate, getAccountDetails);
router.get('/admin/userdata', authenticate, isAdmin, adminUserData);
router.put('/admin/update/:id', authenticate, isAdmin, updateAccountDetailsByAdmin);

export default router;