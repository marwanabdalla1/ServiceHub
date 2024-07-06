import { Request, Response, NextFunction, RequestHandler } from 'express';
import Account from '../models/account';
import ServiceOffering from "../models/serviceOffering";
import ServiceRequest, { IServiceRequest } from "../models/serviceRequest";
import mongoose, {Document, Types} from 'mongoose';
import Timeslot from "../models/timeslot";
import {createNotification, createNotificationDirect} from "./NotificationController";
import Notification from "../models/notification";
import {NotificationType} from "../models/enums";
import {bookTimeslot, cancelTimeslotDirect} from "./TimeSlotController";



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

export const createServiceRequest: RequestHandler = async (req: Request, res: Response) => {
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
        const { timeSlot, ...requestBody } = req.body;
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
async function updateUserRequestHistory(userId: string, requestId: string) {
    try {
        await Account.findByIdAndUpdate(userId, {
            $push: { requestHistory: requestId }
        });
    } catch (error) {
        console.error("Failed to update user's request history:", error);
        throw new Error("Failed to update user's request history");
    }
}


export const updateServiceRequest: RequestHandler = async (req: Request, res: Response) => {
    // Get the userId from the JWT token
    const userId = (req as any).user.userId;
    const { requestId } = req.params; //get request ID from parameter
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
        const updatedRequest = await ServiceRequest.findByIdAndUpdate(requestId, updates, { new: true, upsert: true, strict: true });
        // if (!updatedRequest) {
        //     return res.status(404).send({ message: 'User not found' });
        // }
        // res.send(updatedRequest);


        // todo: Create and send notification
        // Assuming recipient is determined by logic - can be provider or requester based on context
        // const notificationContent = `Service request ${requestId} has been updated.`;

        // Notify the provider
        // await createNotification({
        //     content: notificationContent,
        //     serviceRequest: requestId,
        //     recipient: serviceRequest.provider
        // });
        //
        // // Notify the requestedBy
        // await createNotification({
        //     content: notificationContent,
        //     serviceRequest: requestId,
        //     recipient: serviceRequest.requestedBy
        // });
        res.status(200).json(updatedRequest);

    } catch (error) {
        res.status(400).send(error);
    }
}


//get all requests of a provider
// In serviceRequestController.js

export const getServiceRequestsByProvider: RequestHandler = async (req, res) => {
    try {


        const { providerId } = req.params; // Extract the provider ID from the URL parameter
        const userId = (req as any).user.userId;

        //make sure only the provider him/herself can get this
        if (userId !== providerId) {
            console.log("userId: ", userId, "\n providerId: ", providerId)
            return res.status(403).json({ message: "Unauthorized access." });
        }

        const serviceRequests = await ServiceRequest.find({ provider: providerId })
            .populate([
                { path: 'requestedBy', select: 'firstName lastName' }, // Exclude _id
                { path: 'provider', select: 'firstName lastName' },
            ])
            .exec();


        // remove everything where the requestor account is deleted
        const filteredRequests = serviceRequests.filter(request => request.requestedBy !== null);

        if (filteredRequests.length === 0) {
            return res.status(404).json({ message: "No service requests found for this provider." });
        }

        res.status(200).json(filteredRequests);
    } catch (error: any) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//get all requests of a provider
// In serviceRequestController.js

export const getIncomingServiceRequestsByProvider: RequestHandler = async (req, res) => {
    try {


        const { providerId } = req.params; // Extract the provider ID from the URL parameter
        const userId = (req as any).user.userId;

        //make sure only the provider him/herself can get this
        if (userId !== providerId) {
            console.log("userId: ", userId, "\n providerId: ", providerId)
            return res.status(403).json({ message: "Unauthorized access." });
        }

        const serviceRequests = await ServiceRequest.find({ provider: providerId, requestStatus: "pending" })
            .populate([
                { path: 'requestedBy', select: 'firstName lastName' }, // Exclude _id
                { path: 'provider', select: 'firstName lastName' },
            ])
            .exec();

        // remove everything where the requestor account is deleted
        const filteredRequests = serviceRequests.filter(request => request.requestedBy !== null);


        if (filteredRequests.length === 0) {
            return res.status(404).json({ message: "No service requests found for this provider." });
        }

        const requestsWithTimeslots = await Promise.all(filteredRequests.map(async (request) => {
            const timeslot = await Timeslot.findOne({ requestId: request._id }).exec();
            return { ...request.toObject(), timeslot };
        }));

        console.log("incoming requests with their timeslots", requestsWithTimeslots)

        res.status(200).json(requestsWithTimeslots);
    } catch (error: any) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const getServiceRequestsByRequester: RequestHandler = async (req, res) => {
    try {


        const { requesterId } = req.params; // Extract the provider ID from the URL parameter
        const userId = (req as any).user.userId;

        //make sure only the provider him/herself can get this
        if (userId !== requesterId) {
            console.log("userId: ", userId, "\n requesterId: ", requesterId)
            return res.status(403).json({ message: "Unauthorized access." });
        }

        const serviceRequests = await ServiceRequest.find({ requestedBy: requesterId })
            .populate([
                { path: 'requestedBy', select: 'firstName lastName' }
            ])
            .exec();

        if (serviceRequests.length === 0) {
            return res.status(404).json({ message: "No service requests found for this provider." });
        }

        const requestsWithTimeslots = await Promise.all(serviceRequests.map(async (request) => {
            const timeslot = await Timeslot.findOne({ requestId: request._id }).exec();
            return { ...request.toObject(), timeslot };
        }));

        console.log("incoming requests with their timeslots", requestsWithTimeslots)

        res.status(200).json(requestsWithTimeslots);

    } catch (error: any) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



// only one-time method to clean up the DB
// export const cleanUpServiceRequests: RequestHandler = async (req, res) => {
//     try {
//         // Find all service requests
//         const serviceRequests = await ServiceRequest.find().exec();
//
//         // Find and delete service requests without a corresponding timeslot
//         const deletedRequests = await Promise.all(serviceRequests.map(async (request) => {
//             const timeslot = await Timeslot.findOne({ requestId: request._id }).exec();
//             if (!timeslot) {
//                 await ServiceRequest.findByIdAndDelete(request._id);
//                 return request._id;
//             }
//             return null;
//         }));
//
//         // Filter out null values from the deletedRequests array
//         const deletedRequestIds = deletedRequests.filter(id => id !== null);
//
//         if (deletedRequestIds.length === 0) {
//             return res.status(200).json({ message: "No service requests without timeslots were found." });
//         }
//
//         res.status(200).json({ message: "Deleted service requests without timeslots", deletedRequestIds });
//     } catch (error: any) {
//         console.error("Failed to clean up service requests:", error);
//         res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };



// when provider requests the consumer to select a new timeslot
// todo: to finish
export const requestChangeTimeslot: RequestHandler = async (req, res, next) => {
    const { createdById, requestId } = req.body;
    let success = true;  // Flag to track success of booking

    // todo: first cancel the existing timeslot if not yet done
    try {

        const timeslotFound = await Timeslot.findOne({request: requestId})
        if (timeslotFound){
            // const hi = await cancelTimeslotDirect(timeslotFound._id.toString());
        }

        // // Check if the response has been sent by bookTimeslot
        // if (res.headersSent) {
        //     return; // If the response is sent, bookTimeslot was successful
        // }

    } catch (error) {
        console.error("Error in handling timeslot change:", error);
        success = false;  // Update success flag to false on error
        // Only send this error response if headers have not been sent
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to process timeslot change." });
        }
    } finally {
        // Notification should happen regardless of the booking outcome
        const notificationContent = success
            ? `The timeslot of the existing request ${requestId} has been successfully changed.`
            : `Failed to change the timeslot of the existing request ${requestId}.`;
        const notificationType = NotificationType.timeRequestChanged; // Adjust if you have specific types for success/failure

        // Perform notification creation
        try {
            await createNotificationDirect({
                content: notificationContent,
                serviceRequest: requestId,
                notificationType,
                recipient: createdById,
                job: undefined,
                review: undefined
            });
        } catch (notificationError) {
            console.error("Failed to create notification:", notificationError);
            // Optionally handle the failure of notification creation
        }
    }
};

// when consumer changes the timeslot
export const handleChangeTimeslot: RequestHandler = async (req, res, next) => {
    const { createdById, requestId } = req.body;
    let success = true;  // Flag to track success of booking

    try {
        const hi = await bookTimeslot(req, res, next);

        // // Check if the response has been sent by bookTimeslot
        // if (res.headersSent) {
        //     return; // If the response is sent, bookTimeslot was successful
        // }

    } catch (error) {
        console.error("Error in handling timeslot change:", error);
        success = false;  // Update success flag to false on error
        // Only send this error response if headers have not been sent
        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to process timeslot change." });
        }
    } finally {
        // Notification should happen regardless of the booking outcome
        const notificationContent = success
            ? `The timeslot of the existing request ${requestId} has been successfully changed.`
            : `Failed to change the timeslot of the existing request ${requestId}.`;
        const notificationType = NotificationType.timeRequestChanged; // Adjust if you have specific types for success/failure

        // Perform notification creation
        try {
            await createNotificationDirect({
                content: notificationContent,
                serviceRequest: requestId,
                notificationType,
                recipient: createdById,
                job: undefined,
                review: undefined
            });
        } catch (notificationError) {
            console.error("Failed to create notification:", notificationError);
            // Optionally handle the failure of notification creation
        }
    }
};

// export const handleChangeTimeslot: RequestHandler = async (req, res, next) => {
//     const { createdById, requestId } = req.body;
//
//     try {
//         const result = await bookTimeslot(req, res, next);  // Assume bookTimeslot now just handles logic and throws
//         console.log("request controller change timeslot result:", result)
//         res.json(result);
//         await createNotificationDirect({
//             content: `The timeslot of the existing request ${requestId} has been successfully changed.`,
//             serviceRequest: requestId,
//             notificationType: NotificationType.timeRequestChanged,
//             recipient: createdById
//         });
//     } catch (error) {
//         console.error("Error in handling timeslot change:", error);
//         res.status(500).json({ message: "Failed to process timeslot change." });
//         await createNotificationDirect({
//             content: `Failed to change the timeslot of the existing request ${requestId}.`,
//             serviceRequest: requestId,
//             notificationType: NotificationType.timeRequestChanged,
//             recipient: createdById
//         });
//     }
// };


export const getRequestById: RequestHandler = async (req, res) => {
    try {

        const { requestId } = req.params; // Extract the provider ID from the URL parameter


        const userId = (req as any).user.userId;

        // if (userId !== requestId) {
        //     console.log("userId: ", userId, "\n requesterId: ", requestId)
        //     return res.status(403).json({ message: "Unauthorized access." });
        // }

        const serviceRequest = await ServiceRequest.findOne({ _id: requestId })
            // .populate([
            //     { path: 'requestedBy', select: 'firstName lastName' },
            //     {path: 'provider', select: 'firstName lastName'},
            //     {path: 'serviceOffering', select: 'baseDuration bufferTimeDuration'}
            // ])
            // .exec();

        console.log(serviceRequest)

        if (!serviceRequest){
            return res.status(404).json({ message: "No service requests found." });
        }

        //make sure only the provider/consumer him/herself can get this
        if (userId !== serviceRequest.requestedBy._id.toString() && userId !== serviceRequest.provider._id.toString()) {
            console.log("userId: ", userId, "\n requesterId: ", serviceRequest.requestedBy._id, "provider ID:", serviceRequest.provider._id)
            return res.status(403).json({ message: "Unauthorized access." });
        }



        console.log("incoming requests with their timeslots", serviceRequest)

        res.status(200).json(serviceRequest);

    } catch (error: any) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


