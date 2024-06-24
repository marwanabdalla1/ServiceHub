import express from "express";
import { addService, editService } from "../controller/ServiceConroller";
import { authenticate } from "../middleware/authenticate";


const ServiceRouter = express.Router();

ServiceRouter.post('/add-new-service',authenticate, addService);
ServiceRouter.put('/edit-service/:id', authenticate, editService); // Add this line

export default ServiceRouter;
