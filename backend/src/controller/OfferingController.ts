import { Request, Response, NextFunction } from 'express';
import ServiceOffering from "../models/serviceOffering";



//This is the controller for returning all the service offerings, it's not responsible for creating or editing the SERVICES
// All the filtering and sorting is done here in the backend
export const getOfferings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user; // Assuming userId is available in the request (e.g., from authentication middleware)

        const { type, priceRange, locations, isLicensed, searchTerm, page = 1, limit = 10, sortKey } = req.query;
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

            const userOfferings = await ServiceOffering.find({ provider: userId }).populate('provider');

            if (!userOfferings || userOfferings.length === 0) {
                return res.status(404).json({ message: 'No service offerings found for the authenticated user' });
            }

            return res.json(userOfferings);
        } else {
            // If the request is not authenticated, fetch all offerings and apply filters
            const offerings = await ServiceOffering.find().populate('provider').exec();
            const filteredOfferings = filterOfferings(offerings, filters);

            // Separate premium and non-premium offerings
            const premiumOfferings = filteredOfferings.filter(offering => offering.provider.isPremium);
            const nonPremiumOfferings = filteredOfferings.filter(offering => !offering.provider.isPremium);

            // Sort the premium offerings
            if (sortKey) {
                sortOfferings(premiumOfferings, sortKey as string);
            }

            // Take the top 4 premium offerings
            const topPremiumOfferings = premiumOfferings.slice(0, 4);

            // Sort the remaining offerings (including any additional premium offerings not in the top 4)
            const remainingOfferings = [...premiumOfferings.slice(4), ...nonPremiumOfferings];
            if (sortKey) {
                sortOfferings(remainingOfferings, sortKey as string);
            }

            // Combine the sorted top premium offerings with the rest of the sorted offerings
            const sortedOfferings = [...topPremiumOfferings, ...remainingOfferings];

            // Pagination logic
            const paginatedOfferings = sortedOfferings.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

            return res.json({
                data: paginatedOfferings,
                total: filteredOfferings.length,
            });
        }
    } catch (err: any) {
        res.status(500).send('Internal Server Error');
    }
};

// Helper function to filter offerings
const filterOfferings = (offerings: any[], filters: any) => {
    return offerings.filter(offering => {
        const { type, priceRange, locations, isLicensed, searchTerm } = filters;

        let matchesType = true;
        let matchesPrice = true;
        let matchesLocation = true;
        let matchesLicense = true;
        let matchesSearch = true;

        if (type && type !== '') {
            matchesType = offering.serviceType === type;
        }

        if (priceRange && priceRange.length === 2) {
            const [minPrice, maxPrice] = priceRange.map(Number);
            matchesPrice = offering.hourlyRate >= minPrice && offering.hourlyRate <= maxPrice;
        }

        if (locations && locations.length > 0) {
            matchesLocation = locations.includes(offering.location);
        }

        if (isLicensed !== undefined) {
            matchesLicense = offering.isCertified === (isLicensed === 'true');
        }

        if (searchTerm && searchTerm !== '') {
            const searchRegex = new RegExp(searchTerm, 'i');
            matchesSearch = searchRegex.test(offering.provider?.firstName) ||
                searchRegex.test(offering.provider?.lastName) ||
                searchRegex.test(`${offering.provider?.firstName} ${offering.provider?.lastName}`) ||
                searchRegex.test(offering.provider?.location) ||
                searchRegex.test(offering.serviceType);
        }

        return matchesType && matchesPrice && matchesLocation && matchesLicense && matchesSearch;
    });
};

// Helper function to sort offerings
const sortOfferings = (offerings: any[], sortKey: string) => {
    if (sortKey === "priceAsc") {
        offerings.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortKey === "priceDesc") {
        offerings.sort((a, b) => b.hourlyRate - a.hourlyRate);
    } else if (sortKey === "ratingAsc") {
        offerings.sort((a, b) => a.rating - b.rating);
    } else if (sortKey === "ratingDesc") {
        offerings.sort((a, b) => b.rating - a.rating);
    }
};

export const getServiceOfferingById = async (req: Request, res: Response) => {
    const { offeringId } = req.params;
    try {
        const offering = await ServiceOffering.findById(offeringId)//.populate('provider');
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
        const userId = (req as any).user.userId;
        const offerings = await ServiceOffering.find({ provider: userId }).populate('provider');
        if (!offerings) {
            return res.status(404).json({ message: 'No service offerings found' });
        }
        res.json(offerings);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getServiceOfferingsByUserId = async (req: Request, res: Response) => { //The authenticated version of the getOfferings function (uses token)
    try {
        const userId = req.params.userId;
        const offerings = await ServiceOffering.find({ provider: userId }).populate('provider');
        if (!offerings) {
            return res.status(404).json({ message: 'No service offerings found' });
        }
        res.json(offerings);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};
