import {RequestHandler} from "express";
import jwt from "jsonwebtoken";
import {ifError} from "node:assert";
import Account from "../models/account";

/**
 * Middleware to authenticate a user using a JWT token
 * @param req
 * @param res
 * @param next
 */
export const authenticate: RequestHandler = async (req, res, next) => {
    // Check if the request contains an Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({error: "Unauthorized"});
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({error: "Unauthorized"});
    }

    // Verify the token
    if (!process.env.ACCESS_TOKEN_SECRET) {
        console.log("Access token secret not found")
        return res.status(500).json({
            error: "Internal server error",
            message: "Access token secret not found."
        });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
        if (err) {
            console.log("Invalid token")
            return res.status(403).json({error: "Forbidden"});
        }
        // Check if the userId is included in the payload of the verified token
        if (!user.userId) {
            console.log("Invalid token payload")
            return res.status(403).json({error: "Forbidden", message: "Invalid token payload"});
        }
        (req as any).user = user;
        console.log("User authenticated")
        next();
    });
};

/**
 * Middleware to check if a user is an admin
 * @param req
 * @param res
 * @param next
 */
export const isAdmin: RequestHandler = async (req, res, next) => {
    const user = await Account.findById((req as any).user.userId);
    if (!user || !user.isAdmin) {
        return res.status(403).json({error: "Forbidden", message: "User is not an admin"});
    }
    next();
};
