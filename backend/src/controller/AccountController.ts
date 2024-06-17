import jwt from 'jsonwebtoken';
import Account from "../models/account";
import {RequestHandler} from "express";
import * as dotenv from 'dotenv'
import {validateRequestBody} from "../middleware/validate";
import bcrypt from 'bcrypt';
import {ERRORS} from "../helpers/authHelper";

dotenv.config();

/**
 * Signs up a new user
 * @param req
 * @param res
 * @param next
 */
export const signup: RequestHandler = async (req, res, next) => {
    // Check if body contains required properties
    const error = validateRequestBody(req, res, [
        "firstName",
        "lastName",
        "email",
        "password",
    ]);
    if (error) {
        return error;
    }

    try {
        // Check if email already exists
        const emailExists = await Account.findOne({
            email: req.body.email,
        }).collation({locale: "en", strength: 2});
        if (emailExists) {
            return res.status(400).json({
                error: ERRORS.userAlreadyExists,
                message: "An account with this email already exists."
            });
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // create a user object
        const account = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,

            isProvider: false,
            isPremium: false,
        };

        // create the user in the database
        const retAccount = await Account.create(account);
        res.status(201).json(retAccount);
    } catch (err: any) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        // duplicate key error => email already exists
        if (err.code === 11000) {
            return res.status(400).json({
                error: ERRORS.userAlreadyExists,
                message: message,
            });
        } else {
            return res.status(500).json({
                error: "Internal server error",
                message: message,
            });
        }
    }
}

/**
 * Logs in a user by verifying the email and password
 * @param req
 * @param res
 * @param next
 */
export const login: RequestHandler = async (req, res, next) => {
    // Check if body contains required properties
    const error = validateRequestBody(req, res, ["email", "password"]);
    if (error) {
        return error;
    }

    try {
        // Retrieve the user from the database
        const user = await Account.findOne({email: req.body.email}).select('+authentication.password +authentication.salt');
        if (!user) {
            return res.status(400).json({
                error: "Bad Request",
                message: "User not found."
            });
        }

        if (!user.password) {
            return res.status(400).json({
                error: "Bad Request",
                message: "User authentication data not found."
            });
        }

        // Verify the user's password
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) {
            // Handle invalid password
            return res.status(401).json({error: "Invalid password"});
        }

        // User is authenticated, generate a JWT token
        if (!process.env.ACCESS_TOKEN_SECRET) {
            return res.status(500).json({
                error: "Internal server error",
                message: "Access token secret not found."
            });
        }
        const token = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET);
        // Send the token to the user
        return res.status(200).json({token});

    } catch (err: any) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
};

/**
 * Logs out a user by clearing the JWT token
 * @param req
 * @param res
 */
export const logout: RequestHandler = (req, res) => {
    // Clear the JWT token from the client side
    res.status(200).json({message: "Logged out successfully"});
};

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
        return res.status(500).json({
            error: "Internal server error",
            message: "Access token secret not found."
        });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({error: "Forbidden"});
        }
        (req as any).user = user;
        next();
    });
};

/**
 * delete a user by id
 */
export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const user = await Account.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                error: "Not Found",
                message: "User not found."
            });
        }
        return res.status(200).json(user);
    } catch (err: any) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
}