import { Request, Response } from 'express';
import Notification from '../models/notification';
import { Types } from 'mongoose';

// Create a new notification
export const createNotification = async (req: Request, res: Response) => {
    try {
        const { content, serviceRequest, serviceResponse, job, review, recipient } = req.body;
        const newNotification = new Notification({
            isViewed: false,
            content,
            serviceRequest: serviceRequest ? new Types.ObjectId(serviceRequest) : undefined,
            serviceResponse: serviceResponse ? new Types.ObjectId(serviceResponse) : undefined,
            job: job ? new Types.ObjectId(job) : undefined,
            review: review ? new Types.ObjectId(review) : undefined,
            recipient: new Types.ObjectId(recipient)
        });
        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Get all notifications
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification.find();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Get a notification by ID
export const getNotificationById = async (req: Request, res: Response) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Update a notification by ID
export const updateNotification = async (req: Request, res: Response) => {
    try {
        const { isViewed, content, serviceRequest, serviceResponse, job, review, recipient } = req.body;
        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                isViewed,
                content,
                serviceRequest: serviceRequest ? new Types.ObjectId(serviceRequest) : undefined,
                serviceResponse: serviceResponse ? new Types.ObjectId(serviceResponse) : undefined,
                job: job ? new Types.ObjectId(job) : undefined,
                review: review ? new Types.ObjectId(review) : undefined,
                recipient: new Types.ObjectId(recipient)
            },
            { new: true }
        );
        if (!updatedNotification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Delete a notification by ID
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
        if (!deletedNotification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
