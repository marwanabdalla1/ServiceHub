import {Server, Socket} from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import {DefaultEventsMap} from "socket.io/dist/typed-events";

interface AuthenticatedSocket extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {
    userId?: string;
}

/**
 * Initialize socket.io
 * @param server
 */
const initializeSocket = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
            if (!accessTokenSecret) {
                return next(new Error('Authentication error: Access token secret is not defined'));
            }
            jwt.verify(token, accessTokenSecret, (err: jwt.VerifyErrors | null, decoded: any) => {
                if (err) {
                    return next(new Error('Authentication error'));
                }
                socket.userId = decoded.userId;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`User ${socket.userId} connected`);
        socket.join(socket.userId!);
        console.log(`User ${socket.userId} joined room ${socket.userId}`);

        socket.on("disconnect", () => {
            console.log(`User ${socket.userId} disconnected`);
        });
    });

    return io;
};

export {initializeSocket};
