// Purpose: Contains the functions for handling requests to the /account endpoint.
import Account from "../models/account";
import serviceOffering from "../models/serviceOffering";
import notification from "../models/notification";
import review from "../models/review";
import payment from "../models/payment";
import Timeslot from "../models/timeslot";
import serviceRequest from "../models/serviceRequest";
import job from "../models/job";
import { RequestHandler } from "express";
import * as dotenv from 'dotenv'
import mongoose from "mongoose";
import { JobStatus, RequestStatus } from "../models/enums";
import logger from "../../logger";
dotenv.config();

/**
 * delete the authenticated user
 */
/**
 * delete a user by id
 */
export const deleteAccount: RequestHandler = async (req, res, next) => {
    try {
        let userId: string; // To support use by normal users and admins

        if (req.body.adminInitiated) {
            userId = req.body.userId;
        } else {
            userId = (req as any).user.userId;
        }

        logger.info(`Initiating delete process for userId: ${userId}`);

        // Check if the user exists
        const user = await Account.findById(userId);

        if (!user) {
            logger.warn(`User not found: ${userId}`);
            return res.status(404).json({
                error: "Not Found",
                message: "User not found."
            });
        }

        // Delete connected tables
        await serviceOffering.deleteMany({ provider: new mongoose.Types.ObjectId(userId) });
        logger.info(`Deleted service offerings for userId: ${userId}`);

        await notification.deleteMany({ recipient: new mongoose.Types.ObjectId(userId) });
        logger.info(`Deleted notifications for userId: ${userId}`);

        await review.deleteMany({ reviewer: new mongoose.Types.ObjectId(userId) });
        logger.info(`Deleted reviews for userId: ${userId}`);

        await payment.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        logger.info(`Deleted payments for userId: ${userId}`);

        await Timeslot.deleteMany({ createdById: new mongoose.Types.ObjectId(userId) });
        logger.info(`Deleted timeslots for userId: ${userId}`);

        await serviceRequest.updateMany(
            { provider: new mongoose.Types.ObjectId(userId) },
            { $set: { provider: null }, requestStatus: RequestStatus.cancelled }
        );
        await serviceRequest.updateMany(
            { requestedBy: new mongoose.Types.ObjectId(userId) },
            { $set: { requestedBy: null }, requestStatus: RequestStatus.cancelled }
        );
        logger.info(`Updated service requests for userId: ${userId}`);

        await job.updateMany(
            { provider: new mongoose.Types.ObjectId(userId) },
            { $set: { provider: null }, status: JobStatus.cancelled }
        );
        await job.updateMany(
            { receiver: new mongoose.Types.ObjectId(userId) },
            { $set: { receiver: null }, status: JobStatus.cancelled }
        );
        logger.info(`Updated jobs for userId: ${userId}`);

        // Delete the user account
        await Account.findByIdAndDelete(userId);
        logger.info(`Deleted user account for userId: ${userId}`);

        return res.status(200).json(user);
    } catch (err: any) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        logger.error(`Error deleting user account: ${message}`);
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
};


/**
 * get user by id
 * @param req
 * @param res
 */
export const getProviderById: RequestHandler = async (req, res) => {
    try {
        console.log(req.params)
        const account = await Account.findById(req.params.providerId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found! ' + req.params.providerId });
        }
        else if (!account.isProvider) {
            return res.status(400).json({ message: 'This is NOT a provider!' })
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
export const updateAccountDetails: RequestHandler = async (req, res) => {
    // Get the userId from the JWT token
    const userId = (req as any).user.userId;
    const updates = req.body;

    try {
        // Update the user in the database using the userId from the JWT token
        const updatedUser = await Account.findOneAndUpdate({ _id: userId }, updates, { new: true, upsert: true, strict: false });
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

/**
 * get user by id
 * @param req
 * @param res
 */
export const getRequesterById: RequestHandler = async (req, res) => {
    try {
        console.log(req.params)
        const account = await Account.findById(req.params.requesterId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found! ' + req.params.requesterId });
        }
        res.json(account);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
/**
 * get user details filtered by email, firstName, lastName, accountId
 * @param req
 * @param res
 */
export const adminUserData: RequestHandler = async (req, res) => {
    try {
        const { email, firstName, lastName, accountId } = req.query;

        const query: any = {};

        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }
        if (firstName) {
            query.firstName = { $regex: firstName, $options: 'i' };
        }
        if (lastName) {
            query.lastName = { $regex: lastName, $options: 'i' };
        }
        if (accountId) {
            query._id = accountId;
        }

        const accounts = await Account.find(query).select('email firstName lastName role createdOn');
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


/**
 * get user by id
 * @param req
 * @param res
 */
export const getAccountById: RequestHandler = async (req, res) => {
    try {
        console.log(req.params)
        const account = await Account.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Account not found! ' + req.params.id });
        }
        res.json(account);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
