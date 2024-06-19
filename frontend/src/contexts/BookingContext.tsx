import React, {createContext, useContext, useState, ReactNode, useCallback} from 'react';
import { Account } from '../models/Account';
import {ServiceOffering} from "../models/ServiceOffering";
import {ServiceType} from "../models/enums";
import {Review} from "../models/Review";

export interface BookingDetails {
    location: string | undefined;     // Location of service
    // serviceType: string;      // Type of service
    startTime: Date | undefined;         // Time of appointment
    price: number | undefined;        // Price of service
    provider: Account | undefined;     // Service provider
    requestedBy: Account | undefined;  // User who requested the service
    endTime?: Date | null;     // endtime/duration of the service
    serviceOffering: ServiceOffering | undefined;
    serviceType: ServiceType | undefined;
}

interface BookingContextProps {
    bookingDetails: BookingDetails;
    setProvider: (provider: Account) => void;
    setRequestedBy: (user: Account) => void;
    setSelectedServiceDetails: (serviceOffering: ServiceOffering, serviceType: ServiceType, price: number) => void;
    setTimeAndDuration: (startTime: Date, endTime: Date) => void;
    fetchAccountDetails: (offeringId: string) => Promise<Account>;
    fetchOfferingDetails: (offeringId: string) => Promise<ServiceOffering>; // Rename for clarity

}

// const defaultContext: BookingContextProps = {
//     bookingDetails: {
//         // service: '',
//         startTime: null,
//         endTime: null,
//         location: '',
//         price: 0,
//         provider: null,
//         requestedBy: null,
//         serviceOffering: null,
//     },
//     setProvider: () => {},
//     setRequestedBy: () => {},
//     setSelectedServiceDetails: () => {},
//     setTimeAndDuration: () => {},
//     fetchAccountDetails: async () => ({ id: '', firstName: '', lastName: '', email: '' } as Account),
//     fetchOfferingDetails: async () => ({ serviceOfferingId: '',
//         serviceType: ServiceType.bikeRepair, lastUpdatedOn: new Date(), createdOn: new Date(), certificate: null, hourlyRate: 0, description: '', isCertified: false, location: '', provider: new Account('', '', '', '', 0, [], ''), baseDuration: 0, bufferTimeDuration: 0, reviews: [], reviewCount:0, rating: 0 } as ServiceOffering),
// };

const BookingContext = createContext<BookingContextProps | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
        // service: '',
        startTime: undefined,
        endTime: undefined,
        location: undefined,
        price: undefined,
        provider: undefined,
        requestedBy: undefined,
        serviceOffering: undefined,
        serviceType: undefined

    });

    const setProvider = useCallback((provider: Account) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, provider }));
    }, []);

    const setRequestedBy = (user: Account) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, requestedBy: user }));
    };

    const setSelectedServiceDetails = (serviceOffering: ServiceOffering, serviceType: ServiceType, price: number) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, serviceOffering, serviceType, price }));
    };

    const setTimeAndDuration = (startTime: Date, endTime: Date) => {
        setBookingDetails(prevDetails => ({ ...prevDetails, startTime, endTime }));
    };

    const fetchAccountDetails = async (offeringId: string): Promise<Account> => {
        const offeringResponse = await fetch(`/api/offerings/${offeringId}`);
        const offeringData = await offeringResponse.json();
        // console.log(offeringData);

        if (!offeringData.provider) {
            throw new Error('Provider not found in the offering data');
        }

        // Fetch the provider details using the provider ID from the offering data
        const providerResponse = await fetch(`/api/auth/provider/${offeringData.provider}`);
        const providerData = await providerResponse.json();

        // console.log(providerData);
        return providerData as Account;
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