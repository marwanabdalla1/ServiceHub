import jwt from 'jsonwebtoken';
import Account from "../models/account";
import {RequestHandler} from "express";
import * as dotenv from 'dotenv'
import bcrypt from 'bcrypt';
import {ERRORS} from "../helpers/authHelper";
import PlatformFeedback from "../models/platformFeedback";//
//


export const submitFeedback:RequestHandler = async (req, res) => {
    try {
        // Assuming `req.user` is set by the `authenticate` middleware
        const user = (req as any).user;
        console.log("request to submit review by:", JSON.stringify(user))
        if (!user) {
            return res.status(403).json({error: "User data not found, authorization failed."});
        }


        const feedback = {
            givenBy: user.userId,  // or any other user identifier included in the token
            // reviewer : req.body.reviewer,
            category: req.body.category,
            content: req.body.content || "",
            rating: req.body.rating,
            title: req.body.title || "",
        };

        console.log("review Data: ", feedback)

        // Save review to the database
        const savedFeedback = await PlatformFeedback.create(feedback);

        res.status(201).json({ message: "feedback submitted successfully!",
            review: savedFeedback});

        console.log(savedFeedback)


    } catch (error) {
        console.error("Failed to submit review:", error);
        res.status(500).json({error: "Internal server error", message: "Could not submit review."});
    }
};

export const getPremiumUpgradeReviews: RequestHandler = async (req, res) => {
    try {
        const reviews = await PlatformFeedback.find({ category: 'Premium Upgrade' })
            .populate('givenBy'); // populate the givenBy field with the entire Account object
            console.log('reviewes' + reviews)
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        res.status(500).json({ error: "Internal server error", message: "Could not fetch reviews." });
    }
};





