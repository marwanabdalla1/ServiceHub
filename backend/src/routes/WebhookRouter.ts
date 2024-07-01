import express from "express";
import bodyParser from "body-parser";
import { pay, handleStripeWebhook } from "../controller/PaymentController";

const WebhookRouter = express.Router();

WebhookRouter.post("/", bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

export default WebhookRouter;
