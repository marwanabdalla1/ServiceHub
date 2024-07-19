import express from "express";
import {authenticate} from "../middleware/authenticate";
import {
    deleteProfileImage,
    getProfileImageByAuth,
    getProfileImageByUserId,
    uploadProfileImage
} from "../controller/utilityControllers/ProfileImageController";

const router = express.Router();
router.post('/upload/profileImage', authenticate, uploadProfileImage);
router.get('/profileImage/', authenticate, getProfileImageByAuth);
router.get('/profileImage/:userId', getProfileImageByUserId);
router.delete('/profileImage', authenticate, deleteProfileImage);
export default router;