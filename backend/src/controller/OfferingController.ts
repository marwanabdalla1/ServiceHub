import { Request, Response, NextFunction } from 'express';
import Account from '../models/account';
import ServiceOffering from '../models/serviceOffering';

export const getOfferings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accounts = await Account.find().populate('serviceOfferings').exec();
        res.json(accounts);
    } catch (err) {
        console.error('Error fetching data: ', err);
        res.status(500).send('Internal Server Error');
    }
};

