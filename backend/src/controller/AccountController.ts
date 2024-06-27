// Purpose: Contains the functions for handling requests to the /account endpoint.
import Account from "../models/account";
import {RequestHandler} from "express";
import * as dotenv from 'dotenv'

dotenv.config();

/**
 * delete the authenticated user
 */
/**
 * delete a user by id
 */
export const deleteAccount: RequestHandler = async (req, res, next) => {
    try {
        // Get the userId from the JWT token
        const userId = (req as any).user.userId;
        const user = await Account.findByIdAndDelete(userId);
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
// TODO Cascade delete service offerings when an account is deleted


/**
 * get user by id
 * @param req
 * @param res
 */
export const getProviderById:RequestHandler = async (req, res) => {
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

/**
 * Update user details
 * @param req
 * @param res
 */
export const updateAccountDetails: RequestHandler = async(req, res) => {
    // Get the userId from the JWT token
    const userId = (req as any).user.userId;
    const updates = req.body;

    try {
        // Update the user in the database using the userId from the JWT token
        const updatedUser = await Account.findOneAndUpdate({_id: userId}, updates, { new: true, upsert:true, strict:false});
        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.send(updatedUser);
    } catch (error) {
        res.status(400).send(error);
    }
}

/**
 * get user details with token
 */
/**
 * Get user details with token
 */
export const getAccountDetails: RequestHandler = async (req, res) => {
    try {
        // Retrieve the user from the database using the userId from the JWT token
        const user = await Account.findById((req as any).user.userId);
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



