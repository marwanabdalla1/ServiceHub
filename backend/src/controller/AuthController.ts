import jwt from 'jsonwebtoken';
import Account from "../models/account";
import {RequestHandler} from "express";
import * as dotenv from 'dotenv'
import {validateRequestBody} from "../helpers/validate";
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
        const new_account = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,

            isProvider: false,
            isPremium: false,
        };

        // create the user in the database
        const account = await Account.create(new_account);
        // generate a JWT token
        if (!process.env.ACCESS_TOKEN_SECRET) {
            return res.status(500).json({
                error: "Internal server error",
                message: "Access token secret not found."
            });
        }
        const token = jwt.sign({userId: account._id}, process.env.ACCESS_TOKEN_SECRET);
        // send the token to the user
        res.setHeader('Authorization', 'Bearer ' + token);
        res.status(201).json({
            token,
            accountId: account._id,
            isProvider: account.isProvider,
            isPremium: account.isPremium,
        });
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
        const account = await Account.findOne({email: req.body.email}).select('+authentication.password +authentication.salt');
        if (!account) {
            return res.status(400).json({
                error: "Bad Request",
                message: "User not found."
            });
        }

        if (!account.password) {
            return res.status(400).json({
                error: "Bad Request",
                message: "User authentication data not found."
            });
        }

        // Verify the user's password
        const isValidPassword = await bcrypt.compare(req.body.password, account.password);
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
        const token = jwt.sign({userId: account._id}, process.env.ACCESS_TOKEN_SECRET);
        // Send the token to the user
        res.setHeader('Authorization', 'Bearer ' + token);
        return res.status(200).json({
            token,
            accountId: account._id,
            isProvider: account.isProvider,
            isPremium: account.isPremium
        });

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