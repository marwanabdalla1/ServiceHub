import express from 'express';
import { authenticate } from '../controller/AccountController';
import {submitReview} from "../controller/ReviewController";

const router = express.Router();

// Example route that requires authentication
router.post('/', submitReview); //todo: if auth is implemented first in app, no need to have it again

export default router;
