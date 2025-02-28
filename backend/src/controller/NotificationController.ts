import {Request, Response} from 'express';
import Notification from '../models/notification';
import {Types} from 'mongoose';
import {emitNotification} from '../util/notificationsUtils';


interface NotificationInput {
    content: string;
    notificationType: string; // Use string if enum types are causing complexity
    job?: string;
    serviceRequest?: string;
    review?: string;
    recipient: string;
}

/**
 * Create a new notification
 * @param req
 * @param res
 */
export const createNotification = async (req: Request, res: Response) => {
    try {
        const {content, notificationType, job, review, recipient, serviceRequest} = req.body;
        const newNotification = new Notification({
            isViewed: false,
            content,
            notificationType,
            job: job ? new Types.ObjectId(job) : undefined,
            serviceRequest: serviceRequest ? new Types.ObjectId(serviceRequest) : undefined,
            review: review ? new Types.ObjectId(review) : undefined,
            recipient: new Types.ObjectId(recipient)
        });
        const savedNotification = await newNotification.save();
        emitNotification(recipient, savedNotification); // Emit the event after saving

        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(500).json({message: (error as Error).message});
    }
};


/**
 * create a notification direction, not from API endpoint
 * @param content
 * @param notificationType
 * @param job
 * @param review
 * @param recipient
 * @param serviceRequest
 */
export async function createNotificationDirect({
                                                   content,
                                                   notificationType,
                                                   job,
                                                   review,
                                                   recipient,
                                                   serviceRequest
                                               }: NotificationInput) {
    try {
        const newNotification = new Notification({
            isViewed: false,
            content,
            notificationType,
            job: job ? new Types.ObjectId(job) : undefined,
            serviceRequest: serviceRequest ? new Types.ObjectId(serviceRequest) : undefined,
            review: review ? new Types.ObjectId(review) : undefined,
            recipient: new Types.ObjectId(recipient)
        });
        const savedNotification = await newNotification.save();
        emitNotification(recipient, savedNotification); // Emit the event after saving
    } catch (error: any) {
        throw new Error(error.message);
    }
}

// Get all notifications
export const getNotifications = async (req: Request, res: Response) => {
    try {
        // From the token, retrieve all notifications where the recipient is the id from the token
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const notifications = await Notification.find({recipient: userId}).sort({createdAt: -1}); // Sorting by createdAt in descending order
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({message: (error as Error).message});
    }
};


/**
 * Get a notification by ID
 * @param req
 * @param res
 */
export const getNotificationById = async (req: Request, res: Response) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({message: 'Notification not found'});
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({message: (error as Error).message});
    }
};

/**
 * Update a notification by ID
 * @param req
 * @param res
 */
export const updateNotification = async (req: Request, res: Response) => {
    try {
        const {isViewed, content, job, review, recipient, serviceRequest} = req.body;

        // Create an update object dynamically based on the request body
        const updateFields: any = {};
        if (isViewed !== undefined) updateFields.isViewed = isViewed;
        if (content !== undefined) updateFields.content = content;
        if (job !== undefined) updateFields.job = new Types.ObjectId(job);
        if (serviceRequest !== undefined) updateFields.serviceRequest = new Types.ObjectId(serviceRequest);
        if (review !== undefined) updateFields.review = new Types.ObjectId(review);
        if (recipient !== undefined) updateFields.recipient = new Types.ObjectId(recipient);

        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.id,
            updateFields,
            {new: true}
        );
        if (!updatedNotification) return res.status(404).json({message: 'Notification not found'});
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(500).json({message: (error as Error).message});
    }
};

/**
 * Delete a notification by ID
 * @param req
 * @param res
 */
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
        if (!deletedNotification) return res.status(404).json({message: 'Notification not found'});
        res.status(200).json({message: 'Notification deleted'});
    } catch (error) {
        res.status(500).json({message: (error as Error).message});
    }
};

/**
 * Mark a notification as read
 * @param req
 * @param res
 */
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        await Notification.updateMany(
            {recipient: userId, isViewed: false},
            {$set: {isViewed: true}}
        );
        res.status(200).json({message: 'All notifications marked as read'});
    } catch (error) {
        res.status(500).json({message: (error as Error).message});
    }
};