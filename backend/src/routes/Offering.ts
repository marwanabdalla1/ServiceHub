import express from "express";
import { getOfferings, getServiceOfferingById } from "../controller/OfferingController";

const OfferingRouter = express.Router();

OfferingRouter.get("/", getOfferings);

OfferingRouter.get('/:offeringId', getServiceOfferingById);


export default OfferingRouter;
