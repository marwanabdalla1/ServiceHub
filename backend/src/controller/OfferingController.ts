import { Request, Response, NextFunction } from 'express';
import Account from '../models/account'; 



export const getOfferings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, priceRange, locations, isLicensed, searchTerm } = req.query;

        const filters = {
            type,
            priceRange: priceRange ? (priceRange as string).split(',').map(Number) : [],
            locations: locations ? (locations as string).split(',') : [],
            isLicensed,
            searchTerm
        };

        // Fetch all accounts from the database
        const accounts = await Account.find().populate('serviceOfferings').exec();

        // Filter accounts using the helper function due to bug in mongo not able to handle nested queries
        const filteredAccounts = filterAccounts(accounts, filters);

        console.log('Accounts found:', filteredAccounts.length); 
        res.json(filteredAccounts);
    } catch (err) {
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

