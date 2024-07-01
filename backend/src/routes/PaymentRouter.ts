import express from "express";
import bodyParser from "body-parser";
import { pay, handleStripeWebhook, getSubscriptionData, cancelSubscription } from "../controller/PaymentController";
import { authenticate } from "../middleware/authenticate";

const PaymentRouter = express.Router();
PaymentRouter.post("/stripe", bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);
PaymentRouter.post("/payment", authenticate, pay);
PaymentRouter.post("/subscription/cancel", authenticate, cancelSubscription)
PaymentRouter.get("/subscription", authenticate, getSubscriptionData)

export default PaymentRouter;
