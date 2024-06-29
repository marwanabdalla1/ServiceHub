import jwt from 'jsonwebtoken';
import Account from "../models/account";
import {RequestHandler} from "express";
import * as dotenv from 'dotenv'
import bcrypt from 'bcrypt';
import {ERRORS} from "../helpers/authHelper";
import Review from "../models/review";
import Job from "../models/job";
//
//

// todo: sanity check: (add after job and request controllers are done)
// the reviewer has to have used the service (or is the provider)
// no other reviews has existed for this job
export const submitReview:RequestHandler = async (req, res) => {
    try {
        // Assuming `req.user` is set by the `authenticate` middleware
        const user = (req as any).user;
        console.log("request to submit review by:", JSON.stringify(user))
        if (!user) {
            return res.status(403).json({error: "User data not found, authorization failed."});
        }

        // sanity check
        const { content, rating, recipient, serviceOffering, jobId } = req.body;

        // console.log("job: ", req.body)

        const jobDetails = await Job.findById(jobId).select('provider receiver');
        if (!jobDetails) {
            return res.status(404).json({ error: "Job not found." });
        }

        // Check if the user is the client or the provider of the job
        const isClient = jobDetails.receiver._id.toString() === user.userId;
        const isProvider = jobDetails.provider._id.toString() === user.userId;
        if (!isClient && !isProvider) {
            return res.status(403).json({error: "You must be the provider or have used the service to review it."});
        }

        // Check if a review already exists for this job
        const existingReview = await Review.findOne({ job: jobId, reviewer: user.userId });
        if (existingReview) {
            return res.status(400).json({error: "A review for this job already exists."});
        }

        // Additional checks can be made here,

        const reviewData = {
            reviewer: user.userId,  // or any other user identifier included in the token
            // reviewer : req.body.reviewer,
            content: req.body.content || "",
            rating: req.body.rating,
            recipient: req.body.recipient,
            serviceOffering: req.body.serviceOffering,
            job: req.body.jobId,
        };

        console.log("review Data: ", reviewData)

        // Save review to the database
        const savedReview = await Review.create(reviewData);
        res.status(201).json(savedReview);

        // todo: add notification
    } catch (error) {
        console.error("Failed to submit review:", error);
        res.status(500).json({error: "Internal server error", message: "Could not submit review."});
    }
};

// edit review
// --> it should show "last edited at"

// delete review


// review for platform