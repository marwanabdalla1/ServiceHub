import express from "express";
import bodyParser from "body-parser";
import { pay, handleStripeWebhook } from "../controller/PaymentController";

const PaymentRouter = express.Router();
PaymentRouter.post("/stripe", bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);
PaymentRouter.post("/payment", pay);

export default PaymentRouter;
