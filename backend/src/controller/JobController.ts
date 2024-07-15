import { Request, Response, NextFunction, RequestHandler } from 'express';
import Account from '../models/account';
import Job, { IJob } from "../models/job";

import {cancelTimeslotWithRequestId, updateTimeslotWithRequestId} from "./TimeSlotController";
import Timeslot from "../models/timeslot";
import {sortBookingItems} from "../util/requestAndJobUtils";
import ServiceRequest from "../models/serviceRequest";



interface Query {
    provider?: string;
    receiver?: string;
    [key: string]: any;  // Allows additional properties with any type
}

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

// after provider accepted
export const createJob: RequestHandler = async (req: Request, res: Response) => {

    // Assuming `req.user` is set by the `authenticate` middleware
    const user = (req as any).user;

    console.log("request body for creating job:" + req.body)


    // Check for required properties
    const requiredProperties = [
        "status",
        "serviceType",
        "appointmentStartTime",
        "appointmentEndTime", //could be undefined
        "serviceFee",
        "serviceOffering",
        "request",
        "provider",
        "receiver",
    ];

    const error = errorHandler(req, res, requiredProperties);
    if (error) {
        return error;
    }

    // Validate that the provider in the request body matches the authenticated user's ID
    if (req.body.provider !== user.userId) {
        return res.status(403).json({
            error: "Unauthorized",
            message: "Unable to accept this request" //only provider can accept requests and thus create corresponding jobs
        });
    }


    try {
        // Extract fields from req.body and possibly validate or transform them

        const jobDetails = {
            ...req.body,
            provider: user.userId,

        };
        // const jobDetails = req.body; // Simplified, assuming body has all required fields

        console.log("request body job details:" + jobDetails)
        let newJob = await Job.create(jobDetails);

        if (!newJob._id) {
            return res.status(400).send({ message: "Failed to create service request." });
        }


        // push notification to receiver
        // const notificationContent = `A new job has been created.`;

        // todo: move the create notification here from IncomingRequestsTable
        // const newNotification = new Notification({
        //     isViewed: false,
        //     content: notificationContent,
        //     job: newJob._id,
        //     recipient: user.userId,  // Assuming 'recipient' should be notified
        // });
        // const createdNnotification = await Notification.create(newNotification);

        // console.log(createdNnotification)

        // update timeslot

        await updateUserJobHistory(req.body.provider, newJob._id.toString());

        res.status(201).send(newJob);
    } catch (error: any) {
        res.status(400).send({ message: error.message });
    }
};


// also update the jobHistory arrays in the account
async function updateUserJobHistory(userId: string, jobId: string) {
    try {
        await Account.findByIdAndUpdate(userId, {
            $push: { jobHistory: jobId }
        });
    } catch (error) {
        console.error("Failed to update user's job history:", error);
        throw new Error("Failed to update user's job history");
    }
}

export const getJobsByProvider: RequestHandler = async (req, res) => {

    try {

        const { providerId } = req.params; // Extract the provider ID from the URL parameter
        const userId = (req as any).user.userId;

        //make sure only the provider him/herself can get this
        if (userId !== providerId) {
            console.log ("userId: ", userId, "\n providerId: ", providerId)
            return res.status(403).json({ message: "Unauthorized access." });
        }


        const { serviceType, requestStatus, page = 1, limit = 10 } = req.query;

        let query:Query = { provider: providerId };

        // Adding filters based on query parameters
        if (requestStatus) {
            query.status = requestStatus;
        }
        if (serviceType) {
            query.serviceType = serviceType;
        }
        // Fetch all jobs where the 'provider' field matches 'providerId'
        const jobs = await Job.find(query)
            .populate([
                { path: 'receiver', select: 'firstName lastName email profileImageId phoneNumber' },
                { path: 'provider', select: 'firstName lastName email profileImageId phoneNumber' },
            ])
            .exec();

        const jobsWithTimeslots = await Promise.all(jobs.map(async (job) => {
            const timeslot = await Timeslot.findOne({ jobId: job._id }).exec();
            return { ...job.toObject(), timeslot: timeslot || undefined };
        }));

        const sortedJobsWithTimeslots = sortBookingItems(jobsWithTimeslots);

        console.log("jobs with their timeslots", jobsWithTimeslots)
        const paginatedJobssWithTimeslots = sortedJobsWithTimeslots.slice((Number(page)-1) * Number(limit), (Number(page)) * Number(limit));


        res.status(200).json({
            data: paginatedJobssWithTimeslots,
            total: sortedJobsWithTimeslots.length})
        ;
    } catch (error: any) {
        console.error("Failed to retrieve jobs:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getJobsByRequester: RequestHandler = async (req, res) => {
    const { requesterId } = req.params;  // Extract the provider ID from URL parameters
    const userId = (req as any).user.userId;

    //make sure only the provider him/herself can get this
    if (userId !== requesterId) {
        console.log ("userId: ", userId, "\n requesterId: ", requesterId)
        return res.status(403).json({ message: "Unauthorized access." });
    }

    try {


        const { serviceType, status, page = 1, limit = 10 } = req.query;

        console.log("queries", req.query)

        let query:Query = { receiver: requesterId };

        // Adding filters based on query parameters
        if (status) {
            query.status = status;
        }
        if (serviceType) {
            query.serviceType = serviceType;
        }

        // Fetch all jobs where the 'receiver' field matches 'requesterId'
        const jobs = await Job.find({ receiver: requesterId }).populate([
            { path: 'receiver', select: 'firstName lastName email profileImageId phoneNumber' }, // todo: also include profile pic
            { path: 'provider', select: 'firstName lastName email profileImageId phoneNumber' },
        ])
            .exec();



        if (!jobs.length) {
            return res.status(404).json({ message: "No jobs found for this receiver." });
        }

        const jobsWithTimeslots = await Promise.all(jobs.map(async (job) => {
            const timeslot = await Timeslot.findOne({ jobId: job._id }).exec();
            return { ...job.toObject(), timeslot: timeslot || undefined };
        }));

        const sortedJobsWithTimeslots = sortBookingItems(jobsWithTimeslots);

        console.log("jobs with their timeslots", jobsWithTimeslots)
        const paginatedJobssWithTimeslots = sortedJobsWithTimeslots.slice((Number(page)-1) * Number(limit), (Number(page)) * Number(limit));


        res.status(200).json({
            data: paginatedJobssWithTimeslots,
            total: sortedJobsWithTimeslots.length});

    } catch (error: any) {
        console.error("Failed to retrieve jobs:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateJob: RequestHandler = async (req: Request, res: Response) => {
    // Get the userId from the JWT token
    const userId = (req as any).user.userId;
    const { jobId } = req.params; //get request ID from parameter
    const updates = req.body;


    console.log("job updates:", updates)

    const job = await Job.findById(jobId)

    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    //console.log("User ID: ", userId, "Provider ID: ", job.provider._id.toString(), "Receiver ID: ", job.receiver._id.toString())

    // Check if the user is authorized to access this service request
    if (job.provider._id.toString() !== userId && job.receiver._id.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized to access this resource" });
    }

    try {
        // Update the user in the database using the userId from the JWT token
        const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true, upsert: true, strict: true });


        // handle cancellation
        const requiresCancellation = [ "cancelled"].includes(updates.status);
        console.log("requires cancellation: ",requiresCancellation)
        if (requiresCancellation) {
            const cancellationResult = await cancelTimeslotWithRequestId(job.request.toString());
            console.log(cancellationResult.message);
        }

        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(400).send(error);
    }
}



export const getJobById: RequestHandler = async (req, res) => {
    const { jobId } = req.params;  // Extract the Job ID from URL parameters
    const userId = (req as any).user.userId;

    try {
        // Fetch the job where the '_id' field matches 'jobId'
        const job = await Job.findById(jobId).populate([
            { path: 'receiver', select: 'firstName lastName email profileImageId phoneNumber' }, // todo: also include profile pic
            { path: 'provider', select: 'firstName lastName email profileImageId phoneNumber' }]).exec();

        if (!job) {
            return res.status(404).json({ message: "No job found for this ID." });
        }

        //make sure only the provider/consumer him/herself can get this
        if (userId !== job.receiver._id.toString() && userId !== job.provider._id.toString()) {
            console.log("userId: ", userId, "\n receiver ID: ", job.receiver._id, "provider ID:", job.provider._id)
            return res.status(403).json({ message: "Unauthorized access." });
        }


        const timeslot = await Timeslot.findOne({ jobId: jobId }).exec();
        const jobWithTimeslot = { ...job.toObject(), timeslot: timeslot || undefined };

        console.log("incoming requests with their timeslots", jobWithTimeslot)

        res.status(200).json(jobWithTimeslot);
    } catch (error: any) {
        console.error("Failed to retrieve job:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}