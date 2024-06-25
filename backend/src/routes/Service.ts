import express from "express";
import { addService, editService, deleteService } from "../controller/ServiceConroller";
import { authenticate } from "../middleware/authenticate";


const ServiceRouter = express.Router();

ServiceRouter.post('/add-new-service',authenticate, addService);
ServiceRouter.put('/edit-service/:id', authenticate, editService); 
ServiceRouter.delete('/delete-service/:id', authenticate, deleteService);

export default ServiceRouter;
