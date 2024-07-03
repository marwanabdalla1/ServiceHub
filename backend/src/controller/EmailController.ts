import { Request, RequestHandler, Response } from 'express';
import nodemailer from 'nodemailer';
import * as dotenv from "dotenv";
import crypto from 'crypto';
import Account from "../models/account";
import bcrypt from "bcryptjs";

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
    const { otp, email } = req.body;
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
    const { email, password } = req.body;

    try {
        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);
        const updates = { password: hashedPassword };
        const updatedUser = await Account.findOneAndUpdate({ email: email }, updates, {
            new: true,
            upsert: true,
            strict: false
        });
        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send('Password reset successful');
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
};

/**
 * Send an cancellation notification to the user's email
 * @param req
 * @param res
 */
export const sendCancellationNotificationEmail = (req: Request, res: Response): void => {
    const { email, serviceType, startTime, name } = req.body;

    const mailOptions = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: `${serviceType} Appointment Cancellation`,
        text: `Dear ${name}, /n We are sorry to inform you that your scheduled service appointment for ${serviceType} at ${startTime} has been cancelled. /n Please find an alternative timeslot. /n Thank you for understanding. /n Kind regards, /n The ServiceHub Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).send(error.toString());
        } else {
            res.status(200).send(`Cancellation notification sent to  sent to ${email}`);
        }
    });
};

