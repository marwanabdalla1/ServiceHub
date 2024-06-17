import "dotenv/config"
import express from "express";
import account from "./models/account";
import authRouter from "./routes/auth";
import bookingRouter from "./routes/booking";
import cors from "cors";


const app = express();

// Configure CORS for connecting backend and frontend
app.use(cors({
    origin: 'http://localhost:3000', //frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"], // Optional: specify methods
    credentials: true,  // If  frontend needs to handle cookies/session information
    // allowedHeaders: ["Content-Type", "Authorization"] // Optional: specify headers
}));

// // loggin for debugging
// app.use((req, res, next) => {
//     console.log('Origin:', req.headers.origin);
//     console.log('Access-Control-Allow-Origin:', res.getHeader('Access-Control-Allow-Origin'));
//     next();
// });


app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/accounts", bookingRouter);

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
app.use((req, res, next) => {
    const error = new Error(`Endpoint ${req.originalUrl} not found!`);
    next(error);
});

// logging middleware -> logs the request method and original URL
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    res.status(500).json({error: errorMessage});
});

export default app;