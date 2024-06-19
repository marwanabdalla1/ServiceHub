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


// get provider details
export const getProviderById = async (req: Request, res: Response) => {
    try {
        console.log(req.params)
        const account = await Account.findById(req.params.providerId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found! '+ req.params.providerId });
        }
        else if (!account.isProvider){
            return res.status(400).json({message: 'This is NOT a provider!'})
        }
        res.json(account);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const updateUserDetails = async(req: Request, res: Response) => {
    const {id} = req.params;
    console.log(id)
    const updates = req.body;

    console.log(req.body)

    try {
        const updatedUser = await Account.findOneAndUpdate({_id: id}, updates, { new: true, upsert:true, strict:false});
        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send(updatedUser);
        console.log(updatedUser)
    } catch (error) {
        res.status(400).send(error);
    }

}



