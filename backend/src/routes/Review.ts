import express from 'express';
import {
    deleteReview, findAllReviewsToJob,
    findExistingReview,
    getAllReviewsByOffering, getScoreByUser,
    submitReview,
    updateReview
} from "../controller/ReviewController";
import { authenticate } from "../middleware/authenticate";


const router = express.Router();

// Example route that requires authentication
router.post('/', authenticate, submitReview); //todo: if auth is implemented first in app, no need to have it again

router.get('/by-jobs/:jobId', authenticate, findExistingReview);
router.get('/by-jobs-all/:jobId', authenticate, findAllReviewsToJob);


router.patch('/:reviewId', authenticate, updateReview);

router.delete('/:reviewId', authenticate, deleteReview);

router.get('/:offeringId', getAllReviewsByOffering);

router.get('/score/:accountId', authenticate, getScoreByUser);


export default router;

