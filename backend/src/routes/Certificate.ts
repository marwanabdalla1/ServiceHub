import express from "express";
import {authenticate} from "../middleware/authenticate";
import {
    declineCertificate,
    deleteCertificate,
    fetchUncheckedCertificates, fetchCheckedCertificates,
    getCertificate, revertVerifyCertificate,
    uploadCertificate, verifyCertificate
} from "../controller/CertificateController";


const router = express.Router();
router.post('/upload/:serviceId', authenticate, uploadCertificate);
router.get('/:serviceId', authenticate, getCertificate);
router.delete('/:serviceId', authenticate, deleteCertificate);
router.get('/admin/unchecked', authenticate, fetchUncheckedCertificates);
router.get('/admin/checked', authenticate, fetchCheckedCertificates);
router.post('/admin/verifyCertificate', authenticate, verifyCertificate);
router.post('/admin/declineCertificate', authenticate, declineCertificate);
router.post('/admin/revertVerifyCertificate', authenticate, revertVerifyCertificate);

export default router;