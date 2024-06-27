import express from "express";
import {authenticate} from "../middleware/authenticate";
import {deleteFileById, getFile, getFileById, uploadFile} from "../controller/FileController";

const router = express.Router();
router.post('/upload/:fileType', authenticate, uploadFile);
router.get('/:fileType/:fileId', authenticate, getFileById);
router.get('/:fileType/', authenticate, getFile);
router.delete('/:fileType/:fileId', authenticate, deleteFileById);

export default router;