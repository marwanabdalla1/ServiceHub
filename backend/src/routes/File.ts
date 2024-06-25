import express from "express";
import {authenticate} from "../middleware/authenticate";
import {uploadFile} from "../controller/FileController";

const router = express.Router();
router.post('/upload/:fileType', authenticate, uploadFile);

export default router;