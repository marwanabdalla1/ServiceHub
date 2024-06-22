import jwt from 'jsonwebtoken';
import Account from "../models/account";
import {RequestHandler} from "express";
import * as dotenv from 'dotenv'
import {validateRequestBody} from "../middleware/validate";
import bcrypt from 'bcrypt';
import {ERRORS} from "../helpers/authHelper";
import Review from "../models/review";
//
//
export const submitReview:RequestHandler = async (req, res) => {
    try {
        // Assuming `req.user` is set by the `authenticate` middleware
        const user = (req as any).user;
        console.log("request:", JSON.stringify(user))
        if (!user) {
            return res.status(403).json({error: "User data not found, authorization failed."});
        }

        // Additional checks can be made here, e.g., user roles or specific permissions

        const reviewData = {
            // reviewer: user.userId,  // or any other user identifier included in the token
            reviewer : req.body.reviewer,
            content: req.body.content,
            rating: req.body.rating,
            recipient: req.body.recipient,// Assuming reviews are for products
            serviceOffering: req.body.serviceOffering,
            job: req.body.job,
        };

        // Save review to the database
        const savedReview = await Review.create(reviewData);
        res.status(201).json(savedReview);
    } catch (error) {
        console.error("Failed to submit review:", error);
        res.status(500).json({error: "Internal server error", message: "Could not submit review."});
    }
};

// async function saveReviewToDatabase(reviewData) {
    // Implementation depends on your database setup
    // This is a placeholder function to represent database interaction
// }
