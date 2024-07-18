import React, {createContext, useContext, useState, ReactNode, useCallback} from 'react';
import { Account } from '../models/Account';
import {ServiceOffering} from "../models/ServiceOffering";
import {ServiceType} from "../models/enums";
import axios from "axios";
import {Timeslot} from "../models/Timeslot";

export interface BookingDetails {
    location: string | undefined;     // Location of service
    price: number | undefined;        // Price of service
    provider: Account | undefined;     // Service provider
    requestedBy: Account | undefined;  // User who requested the service
    serviceOffering: ServiceOffering | undefined;
    serviceType: ServiceType | undefined;
    timeSlot: Timeslot | undefined;
    [key: string]: any;
}

interface BookingContextProps {
    bookingDetails: BookingDetails;
    setProvider: (provider: Account) => void;
    setRequestedBy: (user: Account) => void;
    setSelectedServiceDetails: (serviceOffering: ServiceOffering, serviceType: ServiceType, price: number) => void;
    setTimeAndDuration: (timeslot: any) => void;
    fetchAccountDetails: (offeringId: string) => Promise<Account>;
    fetchOfferingDetails: (offeringId: string) => Promise<ServiceOffering> ; // Rename for clarity
    resetBookingDetails: () => void;
}

const defaultBookingDetails = {
    location: undefined,
    price: undefined,
    provider: undefined,
    requestedBy: undefined,
    serviceOffering: undefined,
    serviceType: undefined,
    timeSlot: undefined,

};
const BookingContext = createContext<BookingContextProps | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>(defaultBookingDetails);

    const setProvider = useCallback((provider: Account) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, provider }));
    }, []);

    const setRequestedBy = (user: Account) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, requestedBy: user }));
    };

    const setSelectedServiceDetails = (serviceOffering: ServiceOffering, serviceType: ServiceType, price: number) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, serviceOffering, serviceType, price }));
    };

    const setTimeAndDuration = (timeslot: any) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, timeSlot: timeslot }));
    };

    const fetchAccountDetails = async (offeringId: string): Promise<Account> => {
        const offeringResponse = await axios.get(`/api/offerings/${offeringId}`);
        const offeringData = await offeringResponse.data;

        if (!offeringData.provider) {
            throw new Error('Provider not found in the offering data');
        }

        // Fetch the provider details using the provider ID from the offering data
        const providerResponse = await axios.get(`/api/account/providers/${offeringData.provider}`);
        const providerData =  providerResponse.data;

        return providerData;
    };

    const resetBookingDetails = () => setBookingDetails(defaultBookingDetails); // Reset function

    const fetchOfferingDetails = async (offeringId:string) => {
        try {
            const response = await axios.get(`/api/offerings/${offeringId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };


    return (
        <BookingContext.Provider value={{
            bookingDetails,
            setProvider,
            setRequestedBy,
            setSelectedServiceDetails,
            setTimeAndDuration,
            fetchAccountDetails,
            fetchOfferingDetails,
            resetBookingDetails,
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = (): BookingContextProps => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};