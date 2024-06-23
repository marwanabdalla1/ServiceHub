import express from "express";
import { addService } from "../controller/ServiceConroller";
import { authenticate } from "../middleware/authenticate";


const ServiceRouter = express.Router();

ServiceRouter.post('/add-new-service',authenticate, addService);

export default ServiceRouter;
