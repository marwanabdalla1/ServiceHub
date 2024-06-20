import express from "express";
import {  pay, handleStripeWebhook } from "../controller/PaymentController";

const PaymentRouter = express.Router();
PaymentRouter.post("", pay)
PaymentRouter.post("/webhook",handleStripeWebhook)


export default PaymentRouter;