import express from "express";
import {authenticate} from "../middleware/authenticate";
import {
    deleteCertificate,
    fetchUnverifiedCertificates,
    getCertificate,
    uploadCertificate, verifyCertificate
} from "../controller/CertificateController";


const router = express.Router();
router.post('/upload/:serviceId', authenticate, uploadCertificate);
router.get('/:serviceId', authenticate, getCertificate);
router.delete('/:serviceId', authenticate, deleteCertificate);
router.get('/admin/unverified', authenticate, fetchUnverifiedCertificates);
router.post('/admin/verifyCertificate', authenticate, verifyCertificate);

export default router;