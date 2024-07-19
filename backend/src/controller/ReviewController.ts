import {RequestHandler} from "express";
import Review from "../models/review";
import Job from "../models/job";
import ServiceOffering from "../models/serviceOffering";
import {createNotificationDirect} from "./NotificationController";

/**
 * submitting a review
 * @param req
 * @param res
 */
export const submitReview: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(403).json({error: "User data not found, authorization failed."});
        }
        const {content, rating, recipient, serviceOffering, jobId} = req.body;

        const jobDetails = await Job.findById(jobId).select('provider receiver');
        if (!jobDetails) {
            return res.status(404).json({error: "Job not found."});
        }

        // authorization check: Check if the user is the client or the provider of the job
        const isClient = jobDetails.receiver._id.toString() === user.userId;
        const isProvider = jobDetails.provider._id.toString() === user.userId;

        if (!isClient && !isProvider) {
            return res.status(403).json({error: "You must be the provider or have used the service to review it."});
        }


        // make sure you can't give review to yourself!
        if (user.userId === recipient) {
            return res.status(403).json({error: "You cannot give a review to yourself!."});
        }

        // Check if a review already exists for this job
        const existingReview = await Review.findOne({job: jobId, reviewer: user.userId});
        if (existingReview) {
            return res.status(400).json({error: "A review for this job already exists."});
        }

        const reviewData = {
            reviewer: user.userId,
            content: req.body.content || '',
            rating: req.body.rating,
            recipient: req.body.recipient,
            serviceOffering: req.body.serviceOffering,
            job: req.body.jobId,
        };

        // Save review to the database
        const savedReview = await Review.create(reviewData);

        // Update the service offering only if the reviewer is the client
        if (isClient && savedReview) {
            // Update the service offering with new review info and recalculated rating
            await ServiceOffering.findByIdAndUpdate(savedReview.serviceOffering, {
                $push: {reviews: savedReview._id},
            });
            await recalculateServiceOfferingRating(savedReview.serviceOffering);
        }

        // push notification to receiver
        const notificationContent = `A new review has been added to the job ${jobId}.`;

        const newNotification = await createNotificationDirect({
            content: notificationContent,
            notificationType: "New Review",
            review: (savedReview._id as any).toString(),
            job: savedReview.job.toString(),
            recipient: savedReview.recipient.toString(),
        });

        res.status(201).json({
            message: "Review submitted successfully, notification sent.",
            review: savedReview, notification: newNotification
        });

    } catch (error) {
        res.status(500).json({error: "Internal server error", message: "Could not submit review."});
    }
};


/**
 * find review based on jobId and reviewer
 * @param req
 * @param res
 */
export const findExistingReview: RequestHandler = async (req, res) => {
    const user = (req as any).user;
    const {jobId} = req.params;
    const userId = user.userId; // Assuming you're using some authentication middleware

    try {
        const review = await Review.findOne({job: jobId, reviewer: userId});
        if (review) {
            return res.json({success: true, review: review});
        } else {
            // return res.json({ success: false, review: []});
            return res.status(404).json({message: 'No reviews found for this job ID'});

        }
    } catch (error) {
        res.status(500).json({success: false, message: "Server error", error});
    }
}

// find all reviews for a specific job
export const findAllReviewsToJob: RequestHandler = async (req, res) => {
    const user = (req as any).user;
    const {jobId} = req.params;
    const userId = user.userId;

    try {
        const reviews = await Review.find({
            job: jobId,
            $or:
                [
                    {reviewer: userId},
                    {recipient: userId}
                ]
        });
        if (reviews.length > 0) {
            return res.json({success: true, reviews: reviews});
        } else {
            // if no reviews are made yet, still return success
            return res.status(200).json({success: true, reviews: [], message: 'No reviews found for this job ID'});

        }
    } catch (error) {
        res.status(500).json({success: false, message: "Server error", error});
    }
}


/**
 * edit review
 * it should show "last edited at"
 * @param req
 * @param res
 */
export const updateReview: RequestHandler = async (req, res) => {
    const {serviceOfferingId, rating, content} = req.body;
    const {reviewId} = req.params;

    try {
        // Update the review
        const updates = {
            rating: rating,
            content: content || '',
            ...req.body
        }
        const updatedReview = await Review.findByIdAndUpdate(reviewId, {$set: updates}, {new: true});

        if (!updatedReview) {
            return res.status(404).json({message: "Review not found"});
        }

        // logic to update a review
        await recalculateServiceOfferingRating(updatedReview.serviceOffering);

        // push notification to receiver
        const notificationContent = `A review has been updated to ${updatedReview.job}.`;

        const newNotification = await createNotificationDirect({
            content: notificationContent,
            notificationType: "Updated Review",
            review: (updatedReview._id as any).toString(),
            job: updatedReview.job.toString(),
            recipient: updatedReview.recipient.toString(),
        });


        res.status(200).json({
            message: "Review updated and service offering recalculated, notification sent",
            review: updatedReview, notification: newNotification
        });
    } catch (error) {
        res.status(500).json({message: "Failed to update review", error});
    }
};


/**
 * Delete review
 * @param req
 * @param res
 */
export const deleteReview: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(403).json({error: "Authorization failed."});
        }

        const {reviewId} = req.params;

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

        await Review.deleteOne({_id: reviewId});

        // Also update the service offering to remove the review reference
        await ServiceOffering.updateMany(
            {_id: serviceOfferingId},
            {$pull: {reviews: review._id}}
        );

        await recalculateServiceOfferingRating(serviceOfferingId);


        res.status(200).json({message: "Review deleted successfully."});
    } catch (error) {
        res.status(500).json({error: "Internal server error", message: "Could not delete review."});
    }
};

/**
 * Function to recalculate and update the rating and review count for a service offering after a review is updated/added
 * @param serviceOfferingId
 */
async function recalculateServiceOfferingRating(serviceOfferingId: any) {
    try {

        // Find the service offering to get its provider
        const serviceOffering = await ServiceOffering.findById(serviceOfferingId).select('provider');
        if (!serviceOffering) {
            return;
        }

        const reviews = await Review.find({
            serviceOffering: serviceOfferingId,
            recipient: serviceOffering.provider
        });
        const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

        await ServiceOffering.findByIdAndUpdate(serviceOfferingId, {
            rating: averageRating,
            reviewCount: reviewCount,
            totalRating: totalRating
        });

    } catch (error) {
        return;
    }
}


/**
 * Get all reviews of an offering -> this is displayed in the provider's offering profile page
 * This does NOT require signing in!
 * @param req
 * @param res
 */
export const getAllReviewsByOffering: RequestHandler = async (req, res) => {
    // const user = (req as any).user;
    const {offeringId} = req.params;

    try {
        // Find the service offering to get its provider
        const serviceOffering = await ServiceOffering.findById(offeringId).select('provider');
        if (!serviceOffering) {
            return;
        }

        const reviews = await Review.find({
            serviceOffering: offeringId,
            recipient: serviceOffering.provider
        }).populate([
            {path: 'reviewer', select: 'firstName lastName email profileImageId'},
        ]).exec();
        if (reviews) {
            return res.json({review: reviews});
        }

    } catch (error) {
        res.status(500).json({success: false, message: "Server error", error});
    }
}


/**
 * Get all reviews of an offering -> this is displayed in the request/job detail page
 * For provider to see the score of the consumer (the idea is that they can use the score to judge if they want to
 * accept the consumer's request
 * @param req
 * @param res
 */
export const getScoreByUser: RequestHandler = async (req, res) => {
    const user = (req as any).user;
    console.log("get score", user)
    const {accountId} = req.params;
    const userId = user.userId;

    try {

        if (!userId) {
            console.log('No token provided');
            return res.status(401).send({error: 'Please authenticate.'});
        }

        const reviews = await Review.find({
            recipient: accountId
        }).exec();
        if (reviews) {
            // Calculate the average score
            const totalReviews = reviews.length;
            const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageScore = totalReviews > 0 ? totalScore / totalReviews : 0;

            // Return the reviews and the average score
            return res.json({
                averageScore: averageScore.toFixed(2), // Return average score rounded to 2 decimal places
                count: totalReviews
            });
        } else {
            return res.status(200).json({success: true, message: "No reviews found"});
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Server error", error});
    }
}
