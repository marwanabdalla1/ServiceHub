import {Request, RequestHandler, Response} from 'express';
import Account from '../models/account';
import Job from "../models/job";

import {cancelTimeslotWithRequestId} from "./TimeSlotController";
import Timeslot from "../models/timeslot";
import {sortBookingItems} from "../util/requestAndJobUtils";
import {errorHandler} from "../helpers/validate";


interface Query {
    provider?: string;
    receiver?: string;

    [key: string]: any;  // Allows additional properties with any type
}

/**
 * After provider accepted a service request, create a job
 * @param req
 * @param res
 */
export const createJob: RequestHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;

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
        // Extract fields from req.body and create a new job
        const jobDetails = {
            ...req.body,
            provider: user.userId,

        };
        const newJob = await Job.create(jobDetails);

        if (!newJob._id) {
            return res.status(400).send({message: "Failed to create service request."});
        }

        await updateUserJobHistory(req.body.provider, newJob._id.toString());

        res.status(201).send(newJob);
    } catch (error: any) {
        res.status(400).send({message: error.message});
    }
};


/**
 * Update the jobHistory arrays in the account
 * @param userId
 * @param jobId
 */
async function updateUserJobHistory(userId: string, jobId: string) {
    try {
        await Account.findByIdAndUpdate(userId, {
            $push: {jobHistory: jobId}
        });
    } catch (error) {
        throw new Error("Failed to update user's job history");
    }
}

// get all the jobs offered by a provider
export const getJobsByProvider: RequestHandler = async (req, res) => {

    try {

        const {providerId} = req.params; // Extract the provider ID from the URL parameter
        const userId = (req as any).user.userId;

        //make sure only the provider him/herself can get this
        if (userId !== providerId) {
            return res.status(403).json({message: "Unauthorized access."});
        }


        const {serviceType, status, page = 1, limit = 10} = req.query;

        const query: Query = {provider: providerId};

        // Adding filters based on query parameters
        if (status) {
            query.status = status;
        }
        if (serviceType) {
            query.serviceType = serviceType;
        }
        // Fetch all jobs where the 'provider' field matches 'providerId'
        const jobs = await Job.find(query)
            .populate([
                {
                    path: 'receiver',
                    select: 'firstName lastName email profileImageId phoneNumber address location postal country'
                },
                {
                    path: 'provider',
                    select: 'firstName lastName email profileImageId phoneNumber address location postal country'
                },
            ])
            .exec();

        // also get the timeslots of the jobs
        const jobsWithTimeslots = await Promise.all(jobs.map(async (job) => {
            const timeslot = await Timeslot.findOne({jobId: job._id}).exec();
            return {...job.toObject(), timeslot: timeslot || undefined};
        }));

        // sort the jobs according to our sorting logic: future ones closest to today, then past ones closest to today
        const sortedJobsWithTimeslots = sortBookingItems(jobsWithTimeslots);

        // paginate the jobs
        const paginatedJobssWithTimeslots = sortedJobsWithTimeslots.slice((Number(page) - 1) * Number(limit), (Number(page)) * Number(limit));


        res.status(200).json({
            data: paginatedJobssWithTimeslots,
            total: sortedJobsWithTimeslots.length
        })
        ;
    } catch (error: any) {
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}

/**
 * get all the jobs that a person has requested
 * @param req
 * @param res
 */
export const getJobsByRequester: RequestHandler = async (req, res) => {
    const {requesterId} = req.params;  // Extract the provider ID from URL parameters
    const userId = (req as any).user.userId;

    //make sure only the requester him/herself can get this
    if (userId !== requesterId) {
        return res.status(403).json({message: "Unauthorized access."});
    }

    try {

        const {serviceType, status, page = 1, limit = 10} = req.query;

        const query: Query = {receiver: requesterId};

        // Adding filters based on query parameters
        if (status) {
            query.status = status;
        }
        if (serviceType) {
            query.serviceType = serviceType;
        }

        // Fetch all jobs where the 'receiver' field matches 'requesterId'
        const jobs = await Job.find(query).populate([
            {
                path: 'receiver',
                select: 'firstName lastName email profileImageId phoneNumber address location postal country'
            },
            {
                path: 'provider',
                select: 'firstName lastName email profileImageId phoneNumber address location postal country'
            },
        ])
            .exec();


        if (!jobs.length) {
            return res.status(404).json({message: "No jobs found for this receiver."});
        }

        // find the linked timeslots
        const jobsWithTimeslots = await Promise.all(jobs.map(async (job) => {
            const timeslot = await Timeslot.findOne({jobId: job._id}).exec();
            return {...job.toObject(), timeslot: timeslot || undefined};
        }));

        // sort the jobs according to timeslots
        const sortedJobsWithTimeslots = sortBookingItems(jobsWithTimeslots);

        // paginate the jobs
        const paginatedJobsWithTimeslots = sortedJobsWithTimeslots.slice((Number(page) - 1) * Number(limit), (Number(page)) * Number(limit));


        res.status(200).json({
            data: paginatedJobsWithTimeslots,
            total: sortedJobsWithTimeslots.length
        });

    } catch (error: any) {
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}

/**
 * Update a job
 * @param req
 * @param res
 */
export const updateJob: RequestHandler = async (req: Request, res: Response) => {
    // Get the userId from the JWT token
    const userId = (req as any).user.userId;
    const {jobId} = req.params; //get request ID from parameter
    const updates = req.body;


    const job = await Job.findById(jobId)

    if (!job) {
        return res.status(404).json({message: "Job not found"});
    }

    // Check if the user is authorized to access this service request
    if (job.provider._id.toString() !== userId && job.receiver._id.toString() !== userId) {
        return res.status(403).json({message: "Unauthorized to access this resource"});
    }

    try {
        // Update the user in the database using the userId from the JWT token
        const updatedJob = await Job.findByIdAndUpdate(jobId, updates, {new: true, upsert: true, strict: true});


        // handle cancellation: if a job is cancelled, we need to also cancel the booked timeslot
        const requiresCancellation = ["cancelled"].includes(updates.status);
        if (requiresCancellation) {
            const cancellationResult = await cancelTimeslotWithRequestId(job.request.toString());
        }

        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(400).send(error);
    }
}


/**
 * Get job by jobId
 * @param req
 * @param res
 */
export const getJobById: RequestHandler = async (req, res) => {
    const {jobId} = req.params;  // Extract the Job ID from URL parameters
    const userId = (req as any).user.userId;

    try {
        // Fetch the job where the '_id' field matches 'jobId'
        const job = await Job.findById(jobId).populate([
            {
                path: 'receiver',
                select: 'firstName lastName email profileImageId phoneNumber address location postal country'
            },
            {
                path: 'provider',
                select: 'firstName lastName email profileImageId phoneNumber address location postal country'
            }]).exec();

        if (!job) {
            return res.status(404).json({message: "No job found for this ID."});
        }

        //authorization: make sure only the provider/consumer him/herself can get this
        if (userId !== job.receiver._id.toString() && userId !== job.provider._id.toString()) {
            return res.status(403).json({message: "Unauthorized access."});
        }


        const timeslot = await Timeslot.findOne({jobId: jobId}).exec();
        const jobWithTimeslot = {...job.toObject(), timeslot: timeslot || undefined};


        res.status(200).json(jobWithTimeslot);
    } catch (error: any) {
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}