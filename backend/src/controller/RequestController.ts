import {Request, Response, NextFunction, RequestHandler} from 'express';
import Account from '../models/account';
import ServiceOffering from "../models/serviceOffering";
import ServiceRequest, { IServiceRequest } from "../models/serviceRequest";
import mongoose, {Document} from 'mongoose';
import Timeslot from "../models/timeslot";
import {bookTimeslot} from "./TimeSlotController";



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

// export const createServiceRequest: RequestHandler = async (req, res) => {
//     const user = (req as any).user;
//     console.log("request body: " + JSON.stringify(req.body), "userID: ", user.userId);
//
//     // Perform initial validation checks
//     const error = errorHandler(req, res, [
//         "requestStatus", "serviceType", "appointmentStartTime",
//         "appointmentEndTime", "serviceFee", "serviceOffering",
//         "provider", "requestedBy", "profileImageUrl",
//     ]);
//     if (error) {
//         return error;
//     }
//
//     if (req.body.requestedBy !== user.userId) {
//         return res.status(403).json({
//             error: "Unauthorized",
//             message: "Unable to create this request" // Only the corresponding requester can create requests
//         });
//     }
//
//     try {
//         const { timeSlot, ...requestBody } = req.body;
//
//         // Start a transaction
//
//         const session = await mongoose.startSession();
//         session.startTransaction();
//
//         try {
//             // Create the service request
//             let newServiceRequest = await ServiceRequest.create([requestBody], { session: session });
//
//             if (!newServiceRequest) {
//                 throw new Error("Failed to create service request.");
//             }
//
//             // Create the timeslot if specified
//             if (timeSlot) {
//                 const { start, end, title, isFixed, isBooked, createdById } = timeSlot;
//                 bookTimeslot({ start, end, title, isFixed, isBooked, createdById })
//             }
//
//             // Commit the transaction
//             await session.commitTransaction();
//             res.status(201).json(newServiceRequest);
//         } catch (error) {
//             // Abort the transaction on any error
//             await session.abortTransaction();
//             throw error; // This will be caught by the outer catch
//         } finally {
//             // End the session whether success or fail
//             session.endSession();
//         }
//     } catch (error: any) {
//         console.error("Failed to create service request and/or timeslot: ", error);
//         res.status(500).json({ message: error.message });
//     }
// };
//

export const createServiceRequest:RequestHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;

    console.log("request body:" + JSON.stringify(req.body), "userID: ", user.userId)
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


    // Validate that the consumer in the request body matches the authenticated user's ID
    if (req.body.requestedBy !== user.userId) {
        return res.status(403).json({
            error: "Unauthorized",
            message: "Unable to create this request" //only the corresponding requester can create requests
        });
    }


    try {
        // Extract fields from req.body and possibly validate or transform them
        const {timeSlot, ...requestBody} = req.body;
        // const requestBody = req.body; // Simplified, assuming body has all required fields

        console.log("request body: " + requestBody)
        let newServiceRequest = await ServiceRequest.create(requestBody);


        if (!newServiceRequest._id) {
            return res.status(400).send({ message: "Failed to create service request." });
        }
        // update the user
        await updateUserRequestHistory(req.body.provider, newServiceRequest._id.toString());

        // await newServiceRequest.save();
        res.status(201).send(newServiceRequest);
    } catch (error: any) {
        res.status(400).send({ message: error.message });
    }
};

// also update the requestHistory arrays in the account
async function updateUserRequestHistory(userId:string, requestId:string) {
    try {
        await Account.findByIdAndUpdate(userId, {
            $push: { requestHistory: requestId }
        });
    } catch (error) {
        console.error("Failed to update user's request history:", error);
        throw new Error("Failed to update user's request history");
    }
}


export const updateServiceRequest:RequestHandler = async (req: Request, res:Response)=> {
    // Get the userId from the JWT token
    const userId = (req as any).user.userId;
    const {requestId} = req.params; //get request ID from parameter
    const updates = req.body;

    console.log("update service request: ", userId, requestId)
    console.log("request updates:", updates)

    const serviceRequest = await ServiceRequest.findById(requestId)

    if (!serviceRequest) {
        return res.status(404).json({ message: "Service Request not found" });
    }

    // Check if the user is authorized to access this service request
    if (serviceRequest.provider.toString() !== userId.toString() && serviceRequest.requestedBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized to access this resource" });
    }

    try {
        // Update the user in the database using the userId from the JWT token
        const updatedRequest = await ServiceRequest.findByIdAndUpdate(requestId, updates, { new: true, upsert:true, strict:true});
        // if (!updatedRequest) {
        //     return res.status(404).send({ message: 'User not found' });
        // }
        // res.send(updatedRequest);
        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(400).send(error);
    }
}


//get all requests of a provider
// In serviceRequestController.js

export const getServiceRequestsByProvider:RequestHandler = async (req, res) => {
    try {


        const { providerId } = req.params; // Extract the provider ID from the URL parameter
        const userId = (req as any).user.userId;

        //make sure only the provider him/herself can get this
        if (userId !== providerId) {
            console.log ("userId: ", userId, "\n providerId: ", providerId)
            return res.status(403).json({ message: "Unauthorized access." });
        }

        const serviceRequests = await ServiceRequest.find({ provider: providerId })
            .populate([
                { path: 'requestedBy', select: 'firstName lastName' }, // Exclude _id
                { path: 'provider', select: 'firstName lastName' },
            ])
            .exec();

        if (serviceRequests.length === 0) {
            return res.status(404).json({ message: "No service requests found for this provider." });
        }

        res.status(200).json(serviceRequests);
    } catch (error: any) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
