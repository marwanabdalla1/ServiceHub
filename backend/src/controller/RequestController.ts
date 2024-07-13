import { Request, Response, NextFunction, RequestHandler } from 'express';
import Account from '../models/account';
import ServiceRequest, { IServiceRequest } from "../models/serviceRequest";
import Timeslot from "../models/timeslot";
import { createNotificationDirect} from "./NotificationController";
import {NotificationType, RequestStatus} from "../models/enums";
import {
    bookTimeslot,
    bookTimeslotDirect,
    cancelTimeslotDirect,
    cancelTimeslotWithRequestId
} from "./TimeSlotController";
import mongoose, { PipelineStage } from 'mongoose';
import {sortBookingItems} from "../util/requestAndJobUtils";  // Import PipelineStage for correct typing
import {formatDateTime} from "../../../frontend/src/utils/dateUtils";




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


interface Query {
    provider?: string;
    requestedBy?: string;
    [key: string]: any;  // Allows additional properties with any type
}

// new, all-in-one
export const createServiceRequest: RequestHandler = async (req: Request, res: Response, next) => {
    const user = (req as any).user;

    console.log("request body:" + JSON.stringify(req.body), "userID: ", user.userId)
    const error = errorHandler(req, res, [
        "requestStatus",
        "serviceType",
        // "appointmentStartTime",
        // "appointmentEndTime",
        // "uploads",
        // "comment",
        "serviceFee",
        "serviceOffering",
        // "job",
        "provider",
        "requestedBy",
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

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Extract fields from req.body and possibly validate or transform them
        const { timeSlot, ...requestBody } = req.body;
        // const requestBody = req.body; // Simplified, assuming body has all required fields

        console.log("request body: " + requestBody)
        let newServiceRequest = await ServiceRequest.create(requestBody);


        if (!newServiceRequest._id) {
            return res.status(400).send({ message: "Failed to create service request." });
        }

        await bookTimeslotDirect(timeSlot, session);

        // update the user
        await updateUserRequestHistory(req.body.provider, newServiceRequest._id.toString());

        await session.commitTransaction();


        // await newServiceRequest.save();
        res.status(201).send(newServiceRequest);
        //
        // // Attempt to create a notification
        try {
            const notificationContent = `You have a new service request for ${requestBody.serviceType} at ${formatDateTime(timeSlot.start)}.`;

            await createNotificationDirect({
                content:notificationContent,
                notificationType: "New Request",
                serviceRequest: newServiceRequest._id.toString(),
                recipient: req.body.provider // Assuming the provider should be notified
            });
        } catch (notificationError: any) {
            console.error("Failed to create notification:", notificationError.message);
            // Optionally handle the error further, e.g., logging to an error monitoring service
        }

    } catch (error: any) {
        await session.abortTransaction();
        if (error.statusCode===409) {
            res.status(error.statusCode).send({ message: error.message + "it's new baby!" });
        } else{
            res.status(500).send({ message: error.message || "Internal server error" });
        }
        // res.status(400).send({ message: error.message });
    } finally{
        session.endSession();
    }
};


// export const createServiceRequest: RequestHandler = async (req: Request, res: Response, next) => {
//     const user = (req as any).user;
//
//     console.log("request body:" + JSON.stringify(req.body), "userID: ", user.userId)
//     const error = errorHandler(req, res, [
//         "requestStatus",
//         "serviceType",
//         // "appointmentStartTime",
//         // "appointmentEndTime",
//         // "uploads",
//         // "comment",
//         "serviceFee",
//         "serviceOffering",
//         // "job",
//         "provider",
//         "requestedBy",
//     ]);
//     if (error) {
//         return error;
//     }
//
//
//     // Validate that the consumer in the request body matches the authenticated user's ID
//     if (req.body.requestedBy !== user.userId) {
//         return res.status(403).json({
//             error: "Unauthorized",
//             message: "Unable to create this request" //only the corresponding requester can create requests
//         });
//     }
//
//     const session = await mongoose.startSession();
//
//     try {
//         session.startTransaction();
//
//         // Extract fields from req.body and possibly validate or transform them
//         const { timeSlot, ...requestBody } = req.body;
//         // const requestBody = req.body; // Simplified, assuming body has all required fields
//
//         console.log("request body: " + requestBody)
//         let newServiceRequest = await ServiceRequest.create(requestBody);
//
//
//         if (!newServiceRequest._id) {
//             return res.status(400).send({ message: "Failed to create service request." });
//         }
//         // update the user
//         await updateUserRequestHistory(req.body.provider, newServiceRequest._id.toString());
//
//         // await newServiceRequest.save();
//         res.status(201).send(newServiceRequest);
//
//         await session.commitTransaction();
//         session.endSession();
//         //
//         // // Attempt to create a notification
//         // now its at frontend
//         // try {
//         //     const notificationContent = `You have a new service request for ${requestBody.serviceType} at ${formatDateTime(timeSlot.start)}.`;
//         //
//         //     await createNotificationDirect({
//         //         content: "A new service request has been created.",
//         //         notificationType: "New Request",
//         //         serviceRequest: newServiceRequest._id.toString(),
//         //         recipient: req.body.provider // Assuming the provider should be notified
//         //     });
//         // } catch (notificationError: any) {
//         //     console.error("Failed to create notification:", notificationError.message);
//         //     // Optionally handle the error further, e.g., logging to an error monitoring service
//         // }
//
//     } catch (error: any) {
//         await session.abortTransaction();
//         session.endSession();
//         res.status(400).send({ message: error.message });
//     }
// };

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




export const updateServiceRequest: RequestHandler = async (req: Request, res: Response, next) => {
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
        // Check if status is being updated to one of the specific statuses
        const requiresCancellation = [RequestStatus.declined, RequestStatus.cancelled, RequestStatus.requestorActionNeeded].includes(updates.requestStatus);
        console.log("requires cancellation: ", RequestStatus.requestorActionNeeded)
        if (requiresCancellation) {
            // Cancel the associated timeslot
            const cancellationResult = await cancelTimeslotWithRequestId(requestId);
            console.log(cancellationResult.message);
        }

        console.log("cancellation done", requestId)

        // Update the user in the database using the userId from the JWT token
        const updatedRequest = await ServiceRequest.findByIdAndUpdate(requestId, updates, { new: true, upsert: true, strict: true });
        // if (!updatedRequest) {
        //     return res.status(404).send({ message: 'User not found' });
        // }
        // res.send(updatedRequest);



        // todo: modify Create and send notification (now this is in frontend)
        // const notificationContent = `Service request ${requestId} has been updated.`;

        // if (updates.requestStatus.toString() !== RequestStatus.requestorActionNeeded.toString()){
        //     const content = `Please change the booking time for your service request ${updatedRequest.serviceType} originally scheduled on the ${formatDateTime(serviceRequest.timeslot?.start)}.${
        //         (comment && comment!="") ? `\n Comment from the provider: ${comment}` : ''
        //     }`
        // } else{
        //     const content: `Your service request for ${updatedRequest.serviceType} on the ${formatDateTime(selectedRequest.timeslot?.start)} has been accepted`,
        //
        // }
        // try {
        //     await createNotificationDirect({
        //         content: notificationContent,
        //         serviceRequest: requestId,
        //         notificationType,
        //         recipient: createdById,
        //         job: undefined,
        //         review: undefined
        //     });
        // } catch (notificationError) {
        //     console.error("Failed to create notification:", notificationError);
        //     // Optionally handle the failure of notification creation
        // }
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

        const { serviceType, requestStatus, page, limit } = req.query;

        console.log("queries", req.query)


        let query:Query = { provider: providerId };

        // Adding filters based on query parameters
        if (requestStatus) {
            query.requestStatus = requestStatus;
        }
        if (serviceType) {
            query.serviceType = serviceType;
        }

        const serviceRequests = await ServiceRequest.find(query)
            .populate([
                { path: 'requestedBy', select: 'firstName lastName email profileImageId' }, // todo: also include profile pic
                { path: 'provider', select: 'firstName lastName email profileImageId' }
            ])
            .exec();
        //
        //
        // // remove everything where the requestor account is deleted
        const validRequests = serviceRequests.filter(request => request.requestedBy !== null);
        //
        if (validRequests.length === 0) {
            return res.status(404).json({ message: "No service requests found for this provider." });
        }
        //
        //
        const requestsWithTimeslots = await Promise.all(validRequests.map(async (request) => {
            const timeslot = await Timeslot.findOne({ requestId: request._id }).exec();
            return { ...request.toObject(), timeslot: timeslot || undefined };
        }));

        const sortedRequestsWithTimeslots = sortBookingItems(requestsWithTimeslots);
        //

        console.log("sorted requests", requestsWithTimeslots)
        const paginatedRequestsWithTimeslots = sortedRequestsWithTimeslots.slice((Number(page)-1) * Number(limit), (Number(page)) * Number(limit));


        res.status(200).json({
            data: paginatedRequestsWithTimeslots,
            total:sortedRequestsWithTimeslots.length});


    //      handle pagination
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

        const { serviceType, requestStatus, page = 1, limit = 10 } = req.query;

        console.log("queries", req.query)

        let query:Query = { requestedBy: requesterId };

        // Adding filters based on query parameters
        if (requestStatus) {
            query.requestStatus = requestStatus;
        }
        if (serviceType) {
            query.serviceType = serviceType;
        }

        const serviceRequests = await ServiceRequest.find(query)
            .populate([
                { path: 'requestedBy', select: 'firstName lastName email profileImageId' }, // todo: also include profile pic
                { path: 'provider', select: 'firstName lastName email profileImageId' }
            ])
            .exec();

        const validRequests = serviceRequests.filter(request => request.provider !== null);
        //
        if (validRequests.length === 0) {
            return res.status(404).json({ message: "No service requests found for this requester." });
        }


        const requestsWithTimeslots = await Promise.all(validRequests.map(async (request) => {
            const timeslot = await Timeslot.findOne({ requestId: request._id }).exec();
            return { ...request.toObject(), timeslot };
        }));

        const sortedRequestsWithTimeslots = sortBookingItems(requestsWithTimeslots);
        //

        const paginatedRequestsWithTimeslots = sortedRequestsWithTimeslots.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

        res.status(200).json({
            data: paginatedRequestsWithTimeslots,
            total:sortedRequestsWithTimeslots.length}
        );


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

        // update the request status to pending again
        const updatedRequest = await ServiceRequest.findByIdAndUpdate(requestId, {requestStatus: RequestStatus.pending}, { new: true, upsert: true, strict: true });


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



export const getRequestById: RequestHandler = async (req, res) => {
    try {

        const { requestId } = req.params; // Extract the provider ID from the URL parameter


        const userId = (req as any).user.userId;

        // if (userId !== requestId) {
        //     console.log("userId: ", userId, "\n requesterId: ", requestId)
        //     return res.status(403).json({ message: "Unauthorized access." });
        // }


        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(404).json({ message: "Service request not found." });
        }

        const serviceRequest = await ServiceRequest.findById(requestId).populate([
            { path: 'requestedBy', select: 'firstName lastName email profileImageId' }, // todo: also include profile pic
            { path: 'provider', select: 'firstName lastName email profileImageId' }]).exec();



        console.log(serviceRequest)

        if (!serviceRequest){
            return res.status(404).json({ message: "Service request not found." });
        }

        //make sure only the provider/consumer him/herself can get this
        if (userId !== serviceRequest.requestedBy._id.toString() && userId !== serviceRequest.provider._id.toString()) {
            console.log("userId: ", userId, "\n requesterId: ", serviceRequest.requestedBy._id, "provider ID:", serviceRequest.provider._id)
            return res.status(403).json({ message: "Unauthorized access." });
        }

        const timeslot = await Timeslot.findOne({ requestId: requestId }).exec();
        const requestWithTimeslot = { ...serviceRequest.toObject(), timeslot: timeslot || undefined };



        console.log("incoming requests with their timeslots", requestWithTimeslot)

        res.status(200).json(requestWithTimeslot);

    } catch (error: any) {
        console.error("Failed to retrieve service requests:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




export const deleteRequest: RequestHandler = async (req, res) => {
    const { requestId } = req.params;
    console.log(req)
    const userId = (req as any).user._id; // Assuming your auth middleware sets req.user

    try {
        const serviceRequest = await ServiceRequest.findById(requestId);

        if (!serviceRequest) {
            return res.status(200).json({ message: "No need to delete. Service request not found." });
        }

        // Check if the user is authorized to delete this request
        if (serviceRequest.requestedBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You do not have permission to delete this request." });
        }

        await ServiceRequest.findByIdAndDelete(requestId);
        res.status(200).json({ message: "Service request deleted successfully." });
    } catch (error: any) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};