import express from "express";
import { getOfferings } from "../controller/OfferingController";

const OfferingRouter = express.Router();

OfferingRouter.get("/", getOfferings);

export default OfferingRouter;
