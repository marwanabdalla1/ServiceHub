import {Request, RequestHandler, Response} from 'express';
import nodemailer from 'nodemailer';
import * as dotenv from "dotenv";
import crypto from 'crypto';
import Account from "../models/account";
import bcrypt from "bcrypt";

dotenv.config();

interface OTPStore {
    [email: string]: string;
}

const otpStore: OTPStore = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD
    }
});

/**
 * Send an OTP to the user's email
 * @param req
 * @param res
 */
export const sendResetPasswordEmail = (req: Request, res: Response): void => {
    const {otp, email} = req.body;
    // Store the OTP with the email
    otpStore[email] = otp;

    const mailOptions = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: 'Reset Password OTP',
        text: `Your OTP for password reset is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send(error.toString());
        } else {
            res.status(200).send('OTP sent to email');
        }
    });
};

/**
 * Update the new password and store it in the database
 * @param req
 * @param res
 */
export const setNewPassword: RequestHandler = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);
        const updates = {password: hashedPassword};
        const updatedUser = await Account.findOneAndUpdate({email: email}, updates, {
            new: true,
            upsert: true,
            strict: false
        });
        if (!updatedUser) {
            return res.status(404).send({message: 'User not found'});
        }
        res.status(200).send('Password reset successful');
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
};

