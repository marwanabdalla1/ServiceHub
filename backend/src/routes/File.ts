import express from "express";
import {authenticate} from "../middleware/authenticate";
import {deleteProfileImage, getProfileImage, getFileById, uploadProfileImage} from "../controller/FileController";

const router = express.Router();
router.post('/upload/profileImage', authenticate, uploadProfileImage);
router.get('/:fileType/:fileId', authenticate, getFileById);
router.get('/profileImage/', authenticate, getProfileImage);
router.delete('/profileImage', authenticate, deleteProfileImage);

export default router;