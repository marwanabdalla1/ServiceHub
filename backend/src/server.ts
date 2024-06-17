
import app from "./app";  // import the app.ts file
import env from "./util/validateEnv";  // import the validateEnv.ts file
import mongoose from "mongoose";
const port = env.PORT || 8080;
mongoose.connect(env.MONGO_CONNECTION_STRING!).then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
        console.log("Server running on port: " + port);
    });
}).catch((error) => {
    console.log(error);
});
