import jwt from 'jsonwebtoken';
import Account from "../models/account";
import {RequestHandler} from "express";
import * as dotenv from 'dotenv'
import bcrypt from 'bcrypt';
import {ERRORS} from "../helpers/authHelper";
import Review from "../models/review";
import Notification from "../models/notification"
import Job from "../models/job";
import ServiceOffering from "../models/serviceOffering";
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

        console.log("saved review:", savedReview)


        if (savedReview) {
            // Update the service offering with new review info and recalculated rating
            await ServiceOffering.findByIdAndUpdate(savedReview.serviceOffering, {
                $push: { reviews: savedReview._id },
            });
            await recalculateServiceOfferingRating(savedReview.serviceOffering);
        }



        // push notification to receiver
        const notificationContent = `A new review has been added to ${savedReview.job}.`;
        const newNotification = new Notification({
            isViewed: false,
            content: notificationContent,
            review: savedReview._id,
            job: savedReview.job,
            recipient: savedReview.recipient,  // Assuming 'recipient' should be notified
        });
        const createdNnotification = await Notification.create(newNotification);
        
        console.log(createdNnotification)
        res.status(201).json({ message: "Review submitted successfully, notification sent.",
            review: savedReview, notification: createdNnotification });

    } catch (error) {
        console.error("Failed to submit review:", error);
        res.status(500).json({error: "Internal server error", message: "Could not submit review."});
    }
};


// find review based on jobId and reviewer
export const findExistingReview: RequestHandler = async(req, res) => {
    const user = (req as any).user;
    const { jobId } = req.params;
    console.log("job id for finding request: ", jobId)
    const userId = user.userId; // Assuming you're using some authentication middleware

    try{
        const review = await Review.findOne({ job: jobId, reviewer: userId });
        if (review) {
            return res.json({ success: true, review: review });
         } else {
           return res.json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

// edit review
// --> it should show "last edited at"
export const updateReview: RequestHandler = async (req, res) => {
    const { serviceOfferingId, rating, content } = req.body;
    const {reviewId} = req.params;

    try {
        // Update the review

        const updates = {
            rating: rating,
            content: content,
        }
        const updatedReview = await Review.findByIdAndUpdate(reviewId, { $set: updates}, { new: true });
        console.log("updated Revuew", updatedReview)
        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found" });
        }

            // logic to update a review
        await recalculateServiceOfferingRating(updatedReview.serviceOffering);
            // res.status(200).json(updatedReview);

        // push notification to receiver
        const notificationContent = `A review has been updated to ${updatedReview.job}.`;
        const newNotification = new Notification({
            isViewed: false,
            content: notificationContent,
            review: updatedReview._id,
            job: updatedReview.job,
            recipient: updatedReview.recipient,  // Assuming 'recipient' should be notified
        });
        const createdNnotification = await Notification.create(newNotification);

        console.log(createdNnotification)

        res.status(200).json({ message: "Review updated and service offering recalculated, notification sent",
            review: updatedReview, notification: createdNnotification});
    } catch (error) {
        console.error("Failed to update review:", error);
        res.status(500).json({ message: "Failed to update review", error });
    }
};


// delete review
export const deleteReview: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(403).json({error: "Authorization failed."});
        }

        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({error: "Review not found."});
        }

        // Ensure that the current user is the reviewer
        if (review.reviewer.toString() !== user.userId) {
            return res.status(403).json({error: "Unauthorized to delete this review."});
        }

        // Save serviceOfferingId before deleting the review
        const serviceOfferingId = review.serviceOffering;

        await Review.deleteOne({ _id: reviewId });

        // Also update the service offering to remove the review reference
        await ServiceOffering.updateMany(
            { _id: serviceOfferingId },
            { $pull: { reviews: review._id } }
        );

        await recalculateServiceOfferingRating(serviceOfferingId);


        res.status(200).json({message: "Review deleted successfully."});
    } catch (error) {
        console.error("Failed to delete review:", error);
        res.status(500).json({error: "Internal server error", message: "Could not delete review."});
    }
};

// Function to recalculate and update the rating and review count for a service offering
async function recalculateServiceOfferingRating(serviceOfferingId: any) {
    console.log("service offering id:", serviceOfferingId)
    try {
        const reviews = await Review.find({ serviceOffering: serviceOfferingId });
        // console.log("all reviews:", reviews)
        const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

        await ServiceOffering.findByIdAndUpdate(serviceOfferingId, {
            rating: averageRating,
            reviewCount: reviewCount,
            totalRating: totalRating
        });

        console.log("Service offering ratings recalculated:", { serviceOfferingId, averageRating, reviewCount });
    } catch (error) {
        console.error("Error recalculating service offering ratings:", error);
    }
}



// get all reviews of an offering
// this does NOT require signing in!
export const getAllReviewsByOffering: RequestHandler = async(req, res) => {
    // const user = (req as any).user;
    const { offeringId } = req.params;
    console.log("offering id for finding reviews: ", offeringId)
    // const userId = user.userId; // Assuming you're using some authentication middleware

    try{
        const reviews = await Review.find({ serviceOffering: offeringId });
        if (reviews) {
            return res.json({ review: reviews });
        }
        // else {
        //     return res.json({ success: false });
        // }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}