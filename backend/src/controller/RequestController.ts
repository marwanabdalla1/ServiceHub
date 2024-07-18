import {Request, Response, RequestHandler} from 'express';
import Account from '../models/account';
import ServiceRequest from "../models/serviceRequest";
import Timeslot from "../models/timeslot";
import {createNotificationDirect} from "./NotificationController";
import {NotificationType, RequestStatus} from "../models/enums";
import {
    bookTimeslot,
    bookTimeslotDirect,
    cancelTimeslotWithRequestId, updateTimeslotWithRequestId
} from "./TimeSlotController"; // Importing functions to handle timeslot operations
import mongoose from 'mongoose';
import {sortBookingItems} from "../util/requestAndJobUtils";
import {formatDateTime} from "../util/dateUtils";
/**
 * Handles missing required properties in the request body.
 * @param req - Express request object
 * @param res - Express response object
 * @param requiredProperties - Array of required properties to check in the request body
 * @returns {boolean} - Returns true if any required property is missing, otherwise false
 */
function errorHandler(req: Request, res: Response, requiredProperties: string[]) {
    for (const property of requiredProperties) {
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

/**
 * Interface for query parameters to allow additional properties with any type.
 */
interface Query {
    provider?: string;
    requestedBy?: string;

    [key: string]: any;  // Allows additional properties with any type
}

// Create a new service request
export const createServiceRequest: RequestHandler = async (req: Request, res: Response, next) => {
    const user = (req as any).user;

    const error = errorHandler(req, res, [
        "requestStatus",
        "serviceType",
        "serviceFee",
        "serviceOffering",
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

    // use transaction: either both request + timeslot succeeds or neither
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Extract fields from req.body
        const {timeSlot, ...requestBody} = req.body;

        const newServiceRequest = await ServiceRequest.create(requestBody);

        if (!newServiceRequest._id) {
            return res.status(400).send({message: "Failed to create service request."});
        }

        // book the timeslot
        const timeSlotData = {...timeSlot, requestId: newServiceRequest._id.toString()};
        await bookTimeslotDirect(timeSlotData, session);

        // update the user's request history
        await updateUserRequestHistory(req.body.provider, newServiceRequest._id.toString());

        // commit
        await session.commitTransaction();

        res.status(201).send(newServiceRequest);

        // Attempt to create a notification
        try {
            const notificationContent = `You have a new service request for ${requestBody.serviceType} at ${formatDateTime(timeSlot.start)}.`;

            await createNotificationDirect({
                content: notificationContent,
                notificationType: "New Request",
                serviceRequest: newServiceRequest._id.toString(),
                recipient: req.body.provider
            });
        } catch (notificationError: any) {
        }

    } catch (error: any) {
        await session.abortTransaction();
        if (error.statusCode === 409) {
            res.status(error.statusCode).send({message: error.message + "it's new baby!"});
        } else {
            res.status(500).send({message: error.message || "Internal server error"});
        }
    } finally {
        session.endSession();
    }
};

/**
 * Updates the requestHistory arrays in the account.
 * @param userId - ID of the user to update
 * @param requestId - ID of the request to add to the user's history
 */
async function updateUserRequestHistory(userId: string, requestId: string) {
    try {
        await Account.findByIdAndUpdate(userId, {
            $push: {requestHistory: requestId}
        });
    } catch (error) {
        throw new Error("Failed to update user's request history");
    }
}

/**
 * Updates an existing service request.
 */
export const updateServiceRequest: RequestHandler = async (req: Request, res: Response, next) => {
    const userId = (req as any).user.userId;
    const {requestId} = req.params;
    const updates = req.body;

    const serviceRequest = await ServiceRequest.findById(requestId);

    if (!serviceRequest) {
        return res.status(404).json({message: "Service Request not found"});
    }

    // Check if the user is authorized to access this service request
    if (serviceRequest.provider.toString() !== userId.toString() && serviceRequest.requestedBy.toString() !== userId.toString()) {
        return res.status(403).json({message: "Unauthorized to access this resource"});
    }

    try {
        // check if the update requires us to cancel the timeslot (i.e. release the timeslot to "available" again)
        const requiresCancellation = [RequestStatus.declined, "declined", RequestStatus.cancelled, RequestStatus.requesterActionNeeded].includes(updates.requestStatus);
        if (requiresCancellation) {
            const cancellationResult = await cancelTimeslotWithRequestId(requestId);
        }

        const updatedRequest = await ServiceRequest.findByIdAndUpdate(requestId, updates, {
            new: true,
            upsert: true,
            strict: true
        });

        // updates the timeslot
        if (updates.requestStatus.toString() === "accepted") {
            const updatedtimeslot = await updateTimeslotWithRequestId(requestId, updates.job)
        }
        res.status(200).json(updatedRequest);

    } catch (error) {
        res.status(400).send(error);
    }
}

/**
 * Retrieves all service requests for a specific provider.
 */
export const getServiceRequestsByProvider: RequestHandler = async (req, res) => {
    try {
        const {providerId} = req.params;
        const userId = (req as any).user.userId;

        // Ensure only the provider can get their own requests
        if (userId !== providerId) {
            return res.status(403).json({message: "Unauthorized access."});
        }

        const {serviceType, requestStatus, page, limit} = req.query;

        // only not-accepted requests are retrieved, accepted ones are automatically turned into jobs
        const query: Query = {provider: providerId, requestStatus: {$ne: 'accepted'}};

        // Adding filters based on query parameters
        if (requestStatus) {
            if (Array.isArray(requestStatus)) {
                query.requestStatus = {$in: requestStatus};
            } else {
                query.requestStatus = requestStatus;
            }
        }
        if (serviceType) {
            if (Array.isArray(serviceType)) {
                query.serviceType = {$in: serviceType};
            } else {
                query.serviceType = serviceType;
            }
        }

        // find the requests
        const serviceRequests = await ServiceRequest.find(query)
            .populate([
                {
                    path: 'requestedBy',
                    select: 'firstName lastName email profileImageId phoneNumber address location postal country'
                },
                {
                    path: 'provider',
                    select: 'firstName lastName email profileImageId phoneNumber address location postal country'
                }
            ])
            .exec();

        if (serviceRequests.length === 0) {
            return res.status(404).json({message: "No service requests found for this provider."});
        }

        // find the corresponding timeslots to the request
        const requestsWithTimeslots = await Promise.all(serviceRequests.map(async (request) => {
            const timeslot = await Timeslot.findOne({requestId: request._id}).exec();
            return {...request.toObject(), timeslot: timeslot || undefined};
        }));

        // sort the requests according to time
        const sortedRequestsWithTimeslots = sortBookingItems(requestsWithTimeslots);

        const paginatedRequestsWithTimeslots = sortedRequestsWithTimeslots.slice((Number(page) - 1) * Number(limit), (Number(page)) * Number(limit));

        res.status(200).json({
            data: paginatedRequestsWithTimeslots,
            total: sortedRequestsWithTimeslots.length
        });

    } catch (error: any) {
        res.status(500).json({message: "Internal server error", error: error.message});
    }
};

/**
 * Retrieves all service requests for a specific requester.
 */
export const getServiceRequestsByRequester: RequestHandler = async (req, res) => {
    try {
        const {requesterId} = req.params;
        const userId = (req as any).user.userId;

        // Ensure only the requester can get their own requests
        if (userId !== requesterId) {
            return res.status(403).json({message: "Unauthorized access."});
        }

        const {serviceType, requestStatus, page = 1, limit = 10} = req.query;

        // accepted requests are not included since they are jobs
        const query: Query = {requestedBy: requesterId, requestStatus: {$ne: 'accepted'}};

        // Adding filters based on query parameters
        if (requestStatus) {
            query.requestStatus = requestStatus;
        }
        if (serviceType) {
            query.serviceType = serviceType;
        }

        const serviceRequests = await ServiceRequest.find(query)
            .populate([
                {
                    path: 'requestedBy',
                    select: 'firstName lastName email profileImageId phoneNumber address location postal country'
                },
                {
                    path: 'provider',
                    select: 'firstName lastName email profileImageId phoneNumber address location postal country'
                }
            ])
            .exec();

        if (serviceRequests.length === 0) {
            return res.status(404).json({message: "No service requests found for this requester."});
        }

        const requestsWithTimeslots = await Promise.all(serviceRequests.map(async (request) => {
            const timeslot = await Timeslot.findOne({requestId: request._id}).exec();
            return {...request.toObject(), timeslot};
        }));

        const sortedRequestsWithTimeslots = sortBookingItems(requestsWithTimeslots);

        const paginatedRequestsWithTimeslots = sortedRequestsWithTimeslots.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

        res.status(200).json({
            data: paginatedRequestsWithTimeslots,
            total: sortedRequestsWithTimeslots.length
        });

    } catch (error: any) {
        res.status(500).json({message: "Internal server error", error: error.message});
    }
};

/**
 * Handles changing the timeslot for a service request.
 */
export const handleChangeTimeslot: RequestHandler = async (req, res, next) => {
    const {createdById, requestId, ...slotData} = req.body;

    let success = true;  // Flag to track success of booking


    try {
        // book the new timeslot
        try {
            const bookedTimeslot = await bookTimeslotDirect(req.body);
        } catch (error: any) {
            success = false;
            if (!res.headersSent) {
                res.status(500).json({message: "Failed to process timeslot change."});
            }
        }

        // if booking was successful, update the service request
        if (success) {
            // update the request status to pending again
            const updatedRequest = await ServiceRequest.findByIdAndUpdate(requestId, {requestStatus: RequestStatus.pending}, {
                new: true,
                upsert: true,
                strict: true
            });
            res.status(200).json(updatedRequest)
        }

    } catch (error) {
        success = false;
    } finally {
        if (success) {
            try {
                // for provider
                await createNotificationDirect({
                    content: `The timeslot of the existing request ${requestId} has been successfully changed.`,
                    serviceRequest: requestId,
                    notificationType: NotificationType.timeRequestChanged,
                    recipient: createdById,
                    job: undefined,
                    review: undefined
                });
            } catch (notificationError) {
            }
        }
    }
};

/**
 * Retrieves a service request by its ID.
 */
export const getRequestById: RequestHandler = async (req, res) => {
    try {
        const {requestId} = req.params;

        const userId = (req as any).user.userId;

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(404).json({message: "Service request not found."});
        }

        const serviceRequest = await ServiceRequest.findById(requestId).populate([
            {
                path: 'requestedBy',
                select: 'firstName lastName email profileImageId phoneNumber address location postal country'
            },
            {
                path: 'provider',
                select: 'firstName lastName email profileImageId phoneNumber address location postal country'
            }
        ]).exec();


        if (!serviceRequest) {
            return res.status(404).json({message: "Service request not found."});
        }

        // Ensure only the provider/consumer can access this request
        if (userId !== serviceRequest.requestedBy._id.toString() && userId !== serviceRequest.provider._id.toString()) {
            return res.status(403).json({message: "Unauthorized access."});
        }

        const timeslot = await Timeslot.findOne({requestId: requestId}).exec();
        const requestWithTimeslot = {...serviceRequest.toObject(), timeslot: timeslot || undefined};


        res.status(200).json(requestWithTimeslot);

    } catch (error: any) {
        res.status(500).json({message: "Internal server error", error: error.message});
    }
};

/**
 * Deletes a service request by its ID.
 */
export const deleteRequest: RequestHandler = async (req, res) => {
    const {requestId} = req.params;
    const userId = (req as any).user._id;

    try {
        const serviceRequest = await ServiceRequest.findById(requestId);

        if (!serviceRequest) {
            return res.status(200).json({message: "No need to delete. Service request not found."});
        }

        // Check if the user is authorized to delete this request
        if (serviceRequest.requestedBy.toString() !== userId.toString()) {
            return res.status(403).json({message: "You do not have permission to delete this request."});
        }

        await ServiceRequest.findByIdAndDelete(requestId);
        res.status(200).json({message: "Service request deleted successfully."});
    } catch (error: any) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};



