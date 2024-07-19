import {RequestHandler} from "express";
import PlatformFeedback from "../models/platformFeedback"; //


//This is different than the review controller, this is for the feedback form for the ServiceHub Platform
/**
 * Submit feedback for the ServiceHub Platform
 * @param req
 * @param res
 */
export const submitFeedback: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(403).json({error: "User data not found, authorization failed."});
        }


        const feedback = {
            givenBy: user.userId,  // or any other user identifier included in the token
            category: req.body.category,
            content: req.body.content || "",
            rating: req.body.rating,
            title: req.body.title || "",
        };

        // Save feedback to the database
        const savedFeedback = await PlatformFeedback.create(feedback);

        res.status(201).json({
            message: "feedback submitted successfully!",
            review: savedFeedback
        });


    } catch (error) {
        res.status(500).json({error: "Internal server error", message: "Could not submit review."});
    }
};

/**
 * Get all reviews for the ServiceHub Platform
 * @param req
 * @param res
 */
export const getPremiumUpgradeReviews: RequestHandler = async (req, res) => {
    try {
        const reviews = await PlatformFeedback.find({category: 'Premium Upgrade'})
            .populate('givenBy').exec()

        const filteredReviews = reviews.filter(review => review.givenBy)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)
        res.status(200).json(filteredReviews);
    } catch (error) {
        res.status(500).json({error: "Internal server error", message: "Could not fetch reviews."});
    }
};





