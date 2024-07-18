import express from "express";
import {authenticate, isAdmin} from "../middleware/authenticate";
import {deleteProfileImage, getProfileImageByAuth, getProfileImageByUserId, uploadProfileImage} from "../controller/utilityControllers/ProfileImageController";

const router = express.Router();
router.post('/upload/profileImage', authenticate, uploadProfileImage);
router.post('/upload/profileImage/:accountId', authenticate, isAdmin, uploadProfileImage);
router.get('/profileImage/', authenticate, getProfileImageByAuth);
router.get('/profileImage/:userId', getProfileImageByUserId);
router.delete('/profileImage', authenticate, deleteProfileImage);
router.delete('/profileImage/:accountId', authenticate, isAdmin, deleteProfileImage);
export default router;