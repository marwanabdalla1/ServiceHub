import Account from "../models/account";
import ServiceOffering from '../models/serviceOffering';

import {Request, Response, RequestHandler} from "express";

// Authentication Context
// const AuthContext = React.createContext(null);


function checkAuthentication() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {

        // Redirect to login/signup page
        window.location.href = '/create-account-or-sign-in';  // note: adjust this later if the route changes
    }
}


// get availability of provider



// get provider details
export const getProviderById = async (req: Request, res: Response) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(account);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};



export const getServiceOfferingById = async (req: Request, res: Response) => {
    const { providerId, offeringId } = req.params;
    try {
        const offering = await ServiceOffering.findOne({ _id: offeringId, provider: providerId}).populate('provider');
        if (!offering) {
            return res.status(404).json({ message: 'Service offering not found' });
        }
        res.json(offering);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};