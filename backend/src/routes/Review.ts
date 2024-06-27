import express from 'express';
import {submitReview} from "../controller/ReviewController";
import {authenticate} from "../middleware/authenticate";

const router = express.Router();

// Example route that requires authentication
router.post('/', authenticate, submitReview); //todo: if auth is implemented first in app, no need to have it again

export default router;
