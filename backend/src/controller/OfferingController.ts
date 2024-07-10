import { Request, Response, NextFunction } from 'express';
import Account from '../models/account';
import ServiceOffering from "../models/serviceOffering";



export const getOfferings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user; // Assuming userId is available in the request (e.g., from authentication middleware)
        console.log('User id ' + userId)
        console.log("Getting offerings");

        const { type, priceRange, locations, isLicensed, searchTerm, page = 1, limit = 10 } = req.query;
        const filters = {
            type,
            priceRange: priceRange ? (priceRange as string).split(',').map(Number) : [],
            locations: locations ? (locations as string).split(',') : [],
            isLicensed,
            searchTerm
        };

        if ((req as any).user && (req as any).user.userId) {
            // If the request is authenticated, get offerings for the specific user
            const userId = (req as any).user.userId;
            console.log(`Fetching offerings for user ID: ${userId}`);

            const userOfferings = await ServiceOffering.find({ provider: userId });
            console.log('User offerings:', userOfferings);

            if (!userOfferings || userOfferings.length === 0) {
                return res.status(404).json({ message: 'No service offerings found for the authenticated user' });
            }

            return res.json(userOfferings);
        } else {
            // If the request is not authenticated, fetch all offerings and apply filters
            console.log("Fetching all offerings with filters:", filters);

            const accounts = await Account.find().populate('serviceOfferings').exec();
            const filteredAccounts = filterAccounts(accounts, filters);

            console.log('Filtered accounts found:', filteredAccounts.length);

            // Pagination logic
            const paginatedAccounts = filteredAccounts.slice((page - 1) * limit, page * limit);

            return res.json({
                data: paginatedAccounts,
                total: filteredAccounts.length,
            });
        }
    } catch (err: any) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
};



// Helper function to filter accounts
const filterAccounts = (accounts: any[], filters: any) => {
    return accounts.filter(account => {
        const { type, priceRange, locations, isLicensed, searchTerm } = filters;

        let matchesType = true;
        let matchesPrice = true;
        let matchesLocation = true;
        let matchesLicense = true;
        let matchesSearch = true;

        if (type && type !== '') {
            matchesType = account.serviceOfferings.some((offering: any) => offering.serviceType === type);
        }

        if (priceRange && priceRange.length === 2) {
            const [minPrice, maxPrice] = priceRange.map(Number);
            matchesPrice = account.serviceOfferings.some((offering: any) => offering.hourlyRate >= minPrice && offering.hourlyRate <= maxPrice);
        }

        if (locations && locations.length > 0) {
            matchesLocation = account.serviceOfferings.some((offering: any) => locations.includes(offering.location));
        }

        if (isLicensed !== undefined) {
            matchesLicense = account.serviceOfferings.some((offering: any) => offering.isCertified === (isLicensed === 'true'));
        }

        if (searchTerm && searchTerm !== '') {
            const searchRegex = new RegExp(searchTerm, 'i');
            matchesSearch = searchRegex.test(account.firstName) ||
                searchRegex.test(account.lastName) ||
                searchRegex.test(account.location) ||
                account.serviceOfferings.some((offering: any) => searchRegex.test(offering.serviceType));
        }

        return matchesType && matchesPrice && matchesLocation && matchesLicense && matchesSearch;
    });
};



export const getServiceOfferingById = async (req: Request, res: Response) => {
    console.log("Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
    const {offeringId} = req.params;
    console.log("params:", req.params);
    try {
        const offering = await ServiceOffering.findById(offeringId)//.populate('provider');
        console.log("finding service...")
        if (!offering) {
            return res.status(404).json({ message: 'Service offering not found' });
        }
        res.json(offering);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getServiceOfferingsByUser = async (req: Request, res: Response) => { //The authenticated version of the getOfferings function (uses token)
    try {
        console.log("getting offerings")
        // console.log(req)
        const userId = (req as any).user.userId;
        const offerings = await ServiceOffering.find({ provider: userId });
        // console.log(offerings)
        if (!offerings) {
            return res.status(404).json({ message: 'No service offerings found' });
        }
        res.json(offerings);

    }
    catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

