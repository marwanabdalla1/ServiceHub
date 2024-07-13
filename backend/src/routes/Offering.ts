import express from "express";
import {
    getOfferings,
    getServiceOfferingById,
    getServiceOfferingsByUser,
    getServiceOfferingsByUserId
} from "../controller/OfferingController";
import {authenticate, isAdmin} from "../middleware/authenticate";

const OfferingRouter = express.Router();

OfferingRouter.get('/myoffering', authenticate, getServiceOfferingsByUser);
OfferingRouter.get('/:offeringId', getServiceOfferingById);
OfferingRouter.get("/", getOfferings);
OfferingRouter.get("/admin/userServiceOfferings/:userId",authenticate, isAdmin, getServiceOfferingsByUserId);

export default OfferingRouter;
