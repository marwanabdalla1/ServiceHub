import express from "express";
import { getOfferings, getServiceOfferingById, getServiceOfferingsByUser } from "../controller/OfferingController";
import { authenticate } from "../middleware/authenticate";

const OfferingRouter = express.Router();

OfferingRouter.get('/myoffering', authenticate, getServiceOfferingsByUser);
OfferingRouter.get('/:offeringId', getServiceOfferingById);
OfferingRouter.get("/", getOfferings);

export default OfferingRouter;
