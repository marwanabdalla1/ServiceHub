import cors, { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000', // frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"], // Optional: specify methods
    credentials: true,  // If frontend needs to handle cookies/session information
    // allowedHeaders: ["Content-Type", "Authorization"] // Optional: specify headers
};

const corsConfig = cors(corsOptions);

export default corsConfig;
