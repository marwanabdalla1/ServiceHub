import Account from "../models/account";
import {Request, Response, RequestHandler} from "express";

// Define ERRORS object
const ERRORS = {
    userAlreadyExists: 'User already exists'
};

function errorHandler(req: Request, res: Response, requiredProperties: string[]) {
    for (let property of requiredProperties) {
        if (!req.body[property]) {
            res.status(400).json({
                error: "Bad Request",
                message: `Missing required property: ${property}`
            });
            return true;
        }
    }
    return false;
}



export const signup: RequestHandler = async (req, res, next) => {
    // Check if body contains required properties
    const error = errorHandler(req, res, [
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

        // create a user object
        const account = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            isProvider: false,
            isPremium: false,
        };

        // create the user in the database
        let retAccount = await Account.create(account);
        res.status(201).json(retAccount);
    } catch (err: any) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
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