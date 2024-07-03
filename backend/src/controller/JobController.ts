import { Request, Response, NextFunction, RequestHandler } from 'express';
import Account from '../models/account';
import ServiceOffering from "../models/serviceOffering";
import ServiceRequest, { IServiceRequest } from "../models/serviceRequest";
import Job, { IJob } from "../models/job";

import { Document } from 'mongoose';



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
        // "uploads",
        // "comment",
        "serviceFee",
        "serviceOffering",
        "request",
        "provider",
        "receiver",
        // "profileImageUrl",
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
        // todo: uncomment this later
        // if (userId !== providerId) {
        //     console.log ("userId: ", userId, "\n providerId: ", providerId)
        //     return res.status(403).json({ message: "Unauthorized access." });
        // }


        // Fetch all jobs where the 'provider' field matches 'providerId'
        const jobs = await Job.find({ provider: providerId })
            .populate([
                { path: 'receiver', select: 'firstName lastName' }, // todo: also include profile pic
                { path: 'provider', select: 'firstName lastName' },
            ])
            .exec();

        if (!jobs.length) {
            return res.status(404).json({ message: "No jobs found for this provider." });
        }

        res.status(200).json(jobs);
    } catch (error: any) {
        console.error("Failed to retrieve jobs:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getJobsByRequester: RequestHandler = async (req, res) => {
    const { requesterId } = req.params;  // Extract the provider ID from URL parameters

    try {
        // Fetch all jobs where the 'receiver' field matches 'requesterId'
        const jobs = await Job.find({ receiver: requesterId }).exec();

        if (!jobs.length) {
            return res.status(404).json({ message: "No requested services found for this receiver." });
        }

        res.status(200).json(jobs);
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

        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(400).send(error);
    }
}

export const getJobById: RequestHandler = async (req, res) => {
    const { jobId } = req.params;  // Extract the Job ID from URL parameters

    try {
        // Fetch the job where the '_id' field matches 'jobId'
        const job = await Job.findById(jobId).exec();

        if (!job) {
            return res.status(404).json({ message: "No job found for this ID." });
        }

        res.status(200).json(job);
    } catch (error: any) {
        console.error("Failed to retrieve job:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}