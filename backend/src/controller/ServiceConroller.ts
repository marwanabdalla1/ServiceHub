import { Request, Response, NextFunction } from 'express';
import ServiceOffering from "../models/serviceOffering";
import Account from '../models/account';
import { Types } from 'mongoose';
import { ServiceType } from '../models/enums'; // Assuming this is where your enum is defined

export const addService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        console.log("User id", userId);
        console.log(req.body);

        const {
            selectedService,
            hourlyRate,
            description,
            certificate,
            defaultSlotTime,
            travelTime
        } = req.body;

        // Validate required fields
        if (!selectedService || !hourlyRate || !description || !defaultSlotTime || !travelTime) {
            return res.status(400).send('Missing required fields');
        }

        // Validate if userId corresponds to an existing account
        const account = await Account.findById(userId);
        if (!account) {
            return res.status(404).send('Provider account not found');
        }

        // Map the selected service title to the enum value
        const serviceType = Object.values(ServiceType).find(type => type === selectedService.title);
        if (!serviceType) {
            return res.status(400).send('Invalid service type');
        }

        // Create a new ServiceOffering object
        const newServiceOffering = new ServiceOffering({
            serviceType: serviceType,
            lastUpdatedOn: new Date(),
            // createdOn will be automatically set by the timestamps option
            certificate: {
                name: certificate.name || '',
                data: certificate.data || null,
                contentType: certificate.contentType || ''
            },
            hourlyRate: Number(hourlyRate),
            description: description,
            isCertified: !!certificate.name, // Assuming if there's a certificate object, the service is certified
            location: account.location || 'Unknown location', // Use account's location if available
            provider: new Types.ObjectId(userId),
            baseDuration: defaultSlotTime,
            bufferTimeDuration: travelTime,
            reviews: [],
            rating: 0, // Initial rating is 0
            reviewCount: 0 // Initial review count is 0
        });

        // Save the new service offering to the database
        const savedServiceOffering = await newServiceOffering.save();

        // Update the account's isProvider field to true if it's not already true
        if (!account.isProvider) {
            account.isProvider = true;
        }

        // Add the new service offering to the account's serviceOfferings array
        account.serviceOfferings.push(savedServiceOffering._id as Types.ObjectId);
        await account.save();

        res.status(201).send('Service offering added successfully');
    } catch (err) {
        console.error('Error adding service:', err);
        res.status(500).send('Internal Server Error');
    }
}
