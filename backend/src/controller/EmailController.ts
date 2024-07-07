import { Request, RequestHandler, Response } from 'express';
import nodemailer from 'nodemailer';
import * as dotenv from "dotenv";
import crypto from 'crypto';
import Account from "../models/account";
import bcrypt from "bcryptjs";
import { format } from 'date-fns';
import { ServiceType } from '../models/enums';

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

const generatePasswordResetEmail = (firstName: any, otp: string) => {
  return `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
      <table style="max-width: 600px; margin: auto; border-collapse: collapse; border: 1px solid #ddd;">
        <tr>
          <td style="background-color: #007bff; padding: 20px; text-align: center; color: #fff; font-size: 24px; font-weight: bold;">
            Reset Password OTP
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; font-size: 16px; line-height: 1.5;">
            <b>Dear ${firstName},</b>
            <br /><br />
            To proceed further with your password reset process, please enter the OTP below.
            <br /><br />
            Your password reset OTP is:
            <br /><br />
            <div style="text-align: center;">
              <span style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; font-size: 24px; font-weight: bold;">
                ${otp}
              </span>
            </div>
            <br /><br />
            Please note that this OTP will only be valid for 60 seconds.
            <br /><br />
            Please feel free to contact us in case of any issues. If you did not request this email, please reach out to our email 
            <a href="servicehub.seba22@gmail.com" style="color: #007bff;">servicehub.seba22@gmail.com</a>.
            <br /><br />
            Kind regards,
            <br />
            <b>Your ServiceHub Team</b>
          </td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * Send an OTP to the user's email
 * @param req
 * @param res
 */
export const sendResetPasswordEmail = async (req: Request, res: Response): Promise<void> => {
  const { otp, email } = req.body;

  try {
    const account = await Account.findOne({ email: email });
    if (!account) {
      res.status(400).json({
        error: "User with this email does not exist"
      });
      return;
    }

    otpStore[email] = otp;

    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: 'Reset Password OTP',
      text: `Your OTP for password reset is: ${otp}`,
      html: generatePasswordResetEmail(account?.get("firstName"), otp)
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send('OTP sent to email');
  } catch (error: any) {
    res.status(500).send(error.toString());
  }
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


const generateCancellationEmail = (firstName: string, serviceType: ServiceType, startTime: Date) => {

  const formattedStartTime = format(new Date(startTime), 'PPpp');

  return `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <table style="max-width: 600px; margin: auto; border-collapse: collapse; border: 1px solid #ddd;">
      <tr>
        <td style="background-color: #007bff; padding: 20px; text-align: center; color: #fff; font-size: 24px; font-weight: bold;">
          ${serviceType} Cancellation
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; font-size: 16px; line-height: 1.5;">
          <b>Dear ${firstName},</b>
          <br /><br />
          We are sorry to inform you that your scheduled appointment for ${serviceType} on ${formattedStartTime} has been cancelled. Please try rebooking another appointment. We apologize for any inconvenience.
          <br /><br />
          </div>
          Thank you for understanding!
          <br /><br />
          Please feel free to contact us in case of any issues. 
            <a href="servicehub.seba22@gmail.com" style="color: #007bff;">servicehub.seba22@gmail.com</a>.
            <br /><br />
            Kind regards,
          <br />
          <b>Your ServiceHub Team</b>
        </td>
      </tr>
    </table>
  </div>
`;
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
    html: generateCancellationEmail(name, serviceType, startTime)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send(error.toString());
    } else {
      res.status(200).send(`Cancellation notification sent to  sent to ${email}`);
    }
  });
};

function formatDateTime(startTime: any) {
  throw new Error('Function not implemented.');
}

