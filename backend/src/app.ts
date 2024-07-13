import "dotenv/config";
import express from "express";
import cors from "cors";
import account from "./models/account";
import errorHandler from "./middleware/errorHandler";
import logger from "./middleware/reqlogger";
import notFoundHandler from "./middleware/notFoundHandler";
import AccountRouter from "./routes/Account";
import AuthRouter from "./routes/Auth";
import OfferingRouter from "./routes/Offering";
import RequestRouter from "./routes/Request";
import JobRouter from "./routes/Job";
import ReviewRouter from "./routes/Review";
import NotificationRouter from "./routes/Notifications";
import FeedbackRouter from "./routes/Feedback";
import ProfileImageRouter from "./routes/ProfileImage";
import CertificateRouter from "./routes/Certificate";
import TimeSlotRouter from "./routes/TimeSlot";
import ServiceRouter from "./routes/Service";
import PaymentRouter from "./routes/PaymentRouter";
import WebhookRouter from "./routes/WebhookRouter";
import RecoveryRouter from "./routes/Recovery";
import EmailRouter from "./routes/Email";
import { env } from "process";
import mongoose from "mongoose";

// Import the models to ensure they are registered
import './models/serviceOffering';

const app = express();

// Override the default required string check to allow empty strings
mongoose.Schema.Types.String.checkRequired(v => v != null);

// Configure CORS for connecting backend and frontend
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed methods
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware for logging
app.use(logger);

app.use("/webhook", express.raw({ type: 'application/json' }), WebhookRouter); // DON'T MOVE THIS LINE AFTER EXPRESS.JSON
app.use(express.json());

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/file", ProfileImageRouter);
app.use("/api/certificate", CertificateRouter);
app.use("/api/account", AccountRouter);
app.use("/api/forgetPassword", RecoveryRouter);
app.use("/api/offerings", OfferingRouter);
app.use("/api/timeslots", TimeSlotRouter);
app.use("/api/services", ServiceRouter);
app.use("/api/becomepro", PaymentRouter);
app.use("/api/requests", RequestRouter);
app.use("/api/jobs", JobRouter);
app.use("/api/reviews", ReviewRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/email", EmailRouter);
app.use("/api/feedback", FeedbackRouter);

app.get("/", async (req, res, next) => {
    try {
        // throw Error("Error occurred!"); // Uncomment this line to test error handling
        const accounts = await account.find().exec();
        res.status(200).json(accounts);
    } catch (error) {
        next(error);
    }
});

// Error 404 middleware
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

const port = env.PORT || 8080;

mongoose.connect(env.MONGO_CONNECTION_STRING || "")
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`Server running on port: ${port}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

export default app;
