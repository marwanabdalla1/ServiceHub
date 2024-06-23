import "dotenv/config";
import express from "express";
import cors from "cors";
import account from "./models/account";
import errorHandler from "./middleware/errorHandler";
import logger from "./middleware/logger";
import notFoundHandler from "./middleware/notFoundHandler";
import AccountRouter from "./routes/Account";
import AuthRouter from "./routes/Auth";
import OfferingRouter from "./routes/Offering";
import RequestRouter from "./routes/Request";
import JobRouter from "./routes/Job";
import ReviewRouter from "./routes/Review";


// Import the models to ensure they are registered
import './models/serviceOffering';
import TimeSlotRouter from "./routes/TimeSlot";
import ServiceRouter from "./routes/Service";

const app = express();

// Configure CORS for connecting backend and frontend
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Middleware for logging
app.use(logger);

app.use(express.json());
app.use("/api/auth", AuthRouter);
// authenticate users
// app.use(authenticate)
app.use("/api/account", AccountRouter);
app.use("/api/offerings", OfferingRouter);
app.use("/api/timeslots", TimeSlotRouter);
app.use("/api/services", ServiceRouter);

app.use("/api/requests", RequestRouter);
app.use("/api/jobs", JobRouter);
app.use("/api/reviews", ReviewRouter);


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

export default app;