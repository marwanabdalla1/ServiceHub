import express from "express";
import {authenticate} from "../middleware/authenticate";
import {deleteProfileImage, getProfileImage, uploadProfileImage} from "../controller/ProfileImageController";

const router = express.Router();
router.post('/upload/profileImage', authenticate, uploadProfileImage);
router.get('/profileImage/', authenticate, getProfileImage);
router.delete('/profileImage', authenticate, deleteProfileImage);

export default router;