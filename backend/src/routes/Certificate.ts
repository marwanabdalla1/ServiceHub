import express from "express";
import {authenticate} from "../middleware/authenticate";
import {deleteCertificate, getCertificate, uploadCertificate} from "../controller/CertificateController";


const router = express.Router();
router.post('/upload/:serviceId', authenticate, uploadCertificate);
router.get('/:serviceId', authenticate, getCertificate);
router.delete('/:serviceId', authenticate, deleteCertificate);

export default router;