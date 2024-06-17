import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Account } from '../models/Account';

interface BookingDetails {
    location: string;     // Location of service
    service: string;      // Type of service
    startTime: Date | null;         // Time of appointment
    price: string;        // Price of service
    provider: Account | null;     // Service provider
    requestedBy: Account | null;  // User who requested the service
    endTime?: Date | null;     // endtime/duration of the service
}

interface BookingContextProps {
    bookingDetails: BookingDetails;
    setProvider: (provider: Account) => void;
    setRequestedBy: (user: Account) => void;
    setSelectedServiceDetails: (service: string, price: string) => void;
    setTimeAndDuration: (startTime: Date, endTime: Date) => void;
    fetchAccountDetails: (accountId: string) => Promise<Account>;
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
    },
    setProvider: () => {},
    setRequestedBy: () => {},
    setSelectedServiceDetails: () => {},
    setTimeAndDuration: () => {},
    fetchAccountDetails: async () => ({ id: '', firstName: '', lastName: '', email: '' } as Account),
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
        const response = await fetch(`/api/accounts/${accountId}`);
        const data = await response.json();
        return data as Account;
    };

    return (
        <BookingContext.Provider value={{
            bookingDetails,
            setProvider,
            setRequestedBy,
            setSelectedServiceDetails,
            setTimeAndDuration,
            fetchAccountDetails
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