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


        // Additional checks can be made here,

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
        // const transformedReviews = reviews.map(review => ({
        //     _id: review._id,
        //     title: review.title,
        //     rating: review.rating,
        //     content: review.content,
        //     category: review.category,
        //     givenBy: {
        //         _id: review.givenBy._id,
        //         name: `${review.givenBy.firstName} ${review.givenBy.lastName}`, // Combine firstName and lastName
        //         email: review.givenBy.email,
        //         profileImageUrl: review.givenBy.profileImageUrl,
        //         location: review.givenBy.location,
        //         country: review.givenBy.country,
        //         postal: review.givenBy.postal,
        //         // Include other fields you need from the givenBy object
        //     },
        //     createdAt: review.createdAt,
        //     updatedAt: review.updatedAt
        // }));
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        res.status(500).json({ error: "Internal server error", message: "Could not fetch reviews." });
    }
};

// // find review based on jobId and reviewer
// export const findExistingReview: RequestHandler = async(req, res) => {
//     const user = (req as any).user;
//     const { jobId } = req.params;
//     console.log("job id for finding request: ", jobId)
//     const userId = user.userId; // Assuming you're using some authentication middleware
//
//     try{
//         const review = await Review.findOne({ job: jobId, reviewer: userId });
//         if (review) {
//             return res.json({ success: true, review: review });
//          } else {
//            return res.json({ success: false });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server error", error });
//     }
// }



// delete review
// export const deleteReview: RequestHandler = async (req, res) => {
//     try {
//         const user = (req as any).user;
//         if (!user) {
//             return res.status(403).json({error: "Authorization failed."});
//         }
//
//         const { reviewId } = req.params;
//
//         const review = await Review.findById(reviewId);
//         if (!review) {
//             return res.status(404).json({error: "Review not found."});
//         }
//
//         // Ensure that the current user is the reviewer
//         if (review.reviewer.toString() !== user.userId) {
//             return res.status(403).json({error: "Unauthorized to delete this review."});
//         }
//
//
//
//
//         res.status(200).json({message: "Review deleted successfully."});
//     } catch (error) {
//         console.error("Failed to delete review:", error);
//         res.status(500).json({error: "Internal server error", message: "Could not delete review."});
//     }
// };





