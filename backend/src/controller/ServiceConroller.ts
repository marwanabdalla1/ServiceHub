import {Request, Response, NextFunction} from 'express';
import ServiceOffering from "../models/serviceOffering";
import Account from '../models/account';
import {Types} from 'mongoose';
import {ServiceType} from '../models/enums'; // Assuming this is where your enum is defined


export const addService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        console.log("User id", userId);
        console.log(req.body);

        const {
            selectedService,
            hourlyRate,
            description,
            defaultSlotTime,
            travelTime,
            acceptedPaymentMethods,
        } = req.body;

        // Validate required fields (description is optional, should be validated separately)
        if (!selectedService || !hourlyRate || !defaultSlotTime || !travelTime) {
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
            hourlyRate: Number(hourlyRate),
            description: description,
            acceptedPaymentMethods: acceptedPaymentMethods.map((method: { title: any; }) => method.title) || [],
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

        // Return the saved service offering;
        res.status(201).send(savedServiceOffering);
    } catch (err) {
        console.error('Error adding service:', err);
        res.status(500).send('Internal Server Error');
    }
}

export const editService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const serviceId = req.params.id;
        console.log("User id", userId);
        console.log("Service id", serviceId);
        console.log(req.body);

        const {
            selectedService,
            hourlyRate,
            description,
            defaultSlotTime,
            travelTime,
            acceptedPaymentMethods
        } = req.body;

        // Validate required fields
        if (!selectedService || !hourlyRate || !defaultSlotTime || !travelTime) {
            return res.status(400).send('Missing required fields');
        }

        // Find the service offering
        const serviceOffering = await ServiceOffering.findById(serviceId);
        if (!serviceOffering) {
            return res.status(404).send('Service offering not found');
        }

        // Validate if the service belongs to the user
        if (!serviceOffering.provider.equals(userId)) {
            return res.status(403).send('Unauthorized to edit this service offering');
        }

        // Map the selected service title to the enum value
        const serviceType = Object.values(ServiceType).find(type => type === selectedService.title);
        if (!serviceType) {
            return res.status(400).send('Invalid service type');
        }

        // Update the ServiceOffering object
        // serviceOffering.serviceType = serviceType; //it shouldn't update the service type
        serviceOffering.hourlyRate = Number(hourlyRate);
        serviceOffering.description = description;
        serviceOffering.acceptedPaymentMethods = acceptedPaymentMethods.map((method: {
            title: any;
        }) => method.title) || [],

            serviceOffering.baseDuration = defaultSlotTime;
        serviceOffering.bufferTimeDuration = travelTime;
        serviceOffering.lastUpdatedOn = new Date();

        // Save the updated service offering to the database
        const updatedServiceOffering = await serviceOffering.save();

        res.status(200).send('Service offering updated successfully');
    } catch (err) {
        console.error('Error editing service:', err);
        res.status(500).send('Internal Server Error');
    }
}

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const serviceId = req.params.id;
        console.log("User id", userId);
        console.log("Service id", serviceId);

        // Find the service offering
        const serviceOffering = await ServiceOffering.findById(serviceId);
        if (!serviceOffering) {
            return res.status(404).send('Service offering not found');
        }

        // Validate if the service belongs to the user
        if (!serviceOffering.provider.equals(userId)) {
            return res.status(403).send('Unauthorized to delete this service offering');
        }

        // Delete the service offering from the database
        await serviceOffering.deleteOne();

        // Remove the service offering ID from the user's account
        const account = await Account.findById(userId);
        if (!account) {
            return res.status(404).send('Provider account not found');
        }

        const serviceOfferingIdStr = serviceId.toString();

        // Manually remove the service offering ID from the array
        account.serviceOfferings = account.serviceOfferings.filter(
            (id) => id.toString() !== serviceOfferingIdStr
        );

        await account.save();

        res.status(200).send('Service offering deleted successfully');
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).send('Internal Server Error');
    }
}