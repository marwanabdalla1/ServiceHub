import express from 'express';
import {authenticate} from "../middleware/authenticate";
import {submitFeedback} from "../controller/FeedbackController";

const router = express.Router();

// Example route that requires authentication
router.post('/', authenticate, submitFeedback);

export default router;

