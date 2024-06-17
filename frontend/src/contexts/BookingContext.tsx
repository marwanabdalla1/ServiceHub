import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Account } from '../models/Account';
import {ServiceOffering} from "../models/ServiceOffering";

interface BookingDetails {
    location: string;     // Location of service
    service: string;      // Type of service
    startTime: Date | null;         // Time of appointment
    price: string;        // Price of service
    provider: Account | null;     // Service provider
    requestedBy: Account | null;  // User who requested the service
    endTime?: Date | null;     // endtime/duration of the service
    serviceOffeing: ServiceOffering | null;
}

interface BookingContextProps {
    bookingDetails: BookingDetails;
    setProvider: (provider: Account) => void;
    setRequestedBy: (user: Account) => void;
    setSelectedServiceDetails: (service: string, price: string) => void;
    setTimeAndDuration: (startTime: Date, endTime: Date) => void;
    fetchAccountDetails: (accountId: string) => Promise<Account>;
    fetchOfferingDetails: (offeringId: string) => Promise<ServiceOffering>; // Rename for clarity

}

const defaultContext: BookingContextProps = {
    bookingDetails: {
        service: '',
        startTime: null,
        endTime: null,
        location: '',
        price: '',
        provider: null,
        requestedBy: null,
        serviceOffeing: null,
    },
    setProvider: () => {},
    setRequestedBy: () => {},
    setSelectedServiceDetails: () => {},
    setTimeAndDuration: () => {},
    // fetchAccountDetails: async () => ({ id: '', firstName: '', lastName: '', email: '' } as Account),
    fetchAccountDetails: async (accountId: string): Promise<Account> => {
        const response = await fetch(`/api/provider/${accountId}`);
        const data = await response.json();
        console.log(data);
        return data as Account;
    },
    fetchOfferingDetails: async (offeringId: string) => {
        const response = await fetch(`/api/offerings/${offeringId}`);
        const data = await response.json();
        return data as ServiceOffering;
    },
};

const BookingContext = createContext<BookingContextProps>(defaultContext);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>(defaultContext.bookingDetails);

    const setProvider = (provider: Account) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, provider }));
    };

    const setRequestedBy = (user: Account) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, requestedBy: user }));
    };

    const setSelectedServiceDetails = (service: string, price: string) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, service, price }));
    };

    const setTimeAndDuration = (startTime: Date, endTime: Date) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, startTime, endTime }));
    };

    const fetchAccountDetails = async (accountId: string): Promise<Account> => {
        const response = await fetch(`/api/provider/${accountId}`);
        const data = await response.json();
        console.log(data);
        return data as Account;
    };

    const fetchOfferingDetails = async (offeringId: string) => {
        const response = await fetch(`/api/offerings/${offeringId}`);
        const data = await response.json();
        console.log(data);
        return data as ServiceOffering;
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