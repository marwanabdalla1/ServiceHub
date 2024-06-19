import { Request, Response, NextFunction } from 'express';
import Account from '../models/account';
import ServiceOffering from "../models/serviceOffering";
import ServiceRequest, { IServiceRequest } from "../models/serviceRequest";
import {Document} from 'mongoose';



function errorHandler(req: Request, res: Response, requiredProperties: string[]) {
    for (let property of requiredProperties) {
        if (!req.body[property]) {
            res.status(400).json({
                error: "Bad Request",
                message: `Missing required property: ${property}`
            });
            return true;
        }
    }
    return false;
}

export const createServiceRequest = async (req: Request, res: Response) => {
    console.log("request body:" + req.body)
    const error = errorHandler(req, res, [
        "requestStatus",
        "serviceType",
        "appointmentStartTime",
        "appointmentEndTime",
        // "uploads",
        // "comment",
        "serviceFee",
        "serviceOffering",
        // "job",
        "provider",
        "requestedBy",
        "profileImageUrl",
    ]);
    if (error) {
        return error;
    }


    try {
        // Extract fields from req.body and possibly validate or transform them
        const requestBody = req.body; // Simplified, assuming body has all required fields

        console.log("request body:" + requestBody)
        let newServiceRequest = await ServiceRequest.create(requestBody);

        // await newServiceRequest.save();
        res.status(201).send(newServiceRequest);
    } catch (error: any) {
        res.status(400).send({ message: error.message });
    }
};
