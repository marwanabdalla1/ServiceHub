import {Request, Response, NextFunction, RequestHandler} from 'express';
import Account from '../models/account';
import ServiceOffering from "../models/serviceOffering";
import ServiceRequest, { IServiceRequest } from "../models/serviceRequest";
import Job, { IJob } from "../models/job";

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

// after provider accepted
export const createJob:RequestHandler = async (req: Request, res: Response) => {

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
async function updateUserJobHistory(userId:string, jobId:string) {
    try {
        await Account.findByIdAndUpdate(userId, {
            $push: { jobHistory: jobId }
        });
    } catch (error) {
        console.error("Failed to update user's job history:", error);
        throw new Error("Failed to update user's job history");
    }
}

export const getJobsByProvider: RequestHandler = async(req, res) => {
    const { providerId } = req.params;  // Extract the provider ID from URL parameters

    try {
        // Fetch all jobs where the 'provider' field matches 'providerId'
        const jobs = await Job.find({ provider: providerId }).exec();

        if (!jobs.length) {
            return res.status(404).json({ message: "No jobs found for this provider." });
        }

        res.status(200).json(jobs);
    } catch (error: any) {
        console.error("Failed to retrieve jobs:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}