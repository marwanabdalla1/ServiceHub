import express from 'express';
import {authenticate} from "../middleware/authenticate";
import {getPremiumUpgradeReviews, submitFeedback} from "../controller/FeedbackController";

const router = express.Router();

// Example route that requires authentication
router.get('/premium-upgrade', getPremiumUpgradeReviews)

router.post('/', authenticate, submitFeedback);

export default router;

