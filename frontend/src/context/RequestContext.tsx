import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RequestStatus, ServiceType } from '../models/enums';
import { Job } from '../models/Job';
import { Account } from '../models/Account';
import account from '../models/Account';

interface RequestDetails {
    serviceRequestId: string;
    requestStatus: RequestStatus;
    createdOn: Date;
    serviceType: ServiceType;
    appointmentTime: Date;
    updatedAppointmentTime: Date | null;
    uploads: File[];
    comment: string;
    serviceFee: number;
    duration: number;

    //foreign keys
    job: Job | null;
    provider: Account;
    requestedBy: Account;
    rating: number;
    profileImageUrl: string;

}

interface RequestContextProps {
    requestDetails: RequestDetails;
    setRequestDetails: React.Dispatch<React.SetStateAction<RequestDetails>>;
    selectedTime: string | null;
    setSelectedTime: React.Dispatch<React.SetStateAction<string | null>>;
    selectedDate: string | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
    availableTimes: string[];
    setAvailableTimes: React.Dispatch<React.SetStateAction<string[]>>;
    updateRequestDetails: (details: RequestDetails) => void;
}

const RequestContext = createContext<RequestContextProps | undefined>(undefined);

interface RequestProviderProps {
    children: ReactNode;
}

export const RequestProvider: React.FC<RequestProviderProps> = ({ children }) => {
    const [requestDetails, setRequestDetails] = useState<RequestDetails>({
        serviceRequestId: '000',
        requestStatus: RequestStatus.cancelled,
        createdOn: new Date(),
        serviceType: ServiceType.tutoring,
        appointmentTime: new Date(),
        updatedAppointmentTime: null,
        uploads: [],
        comment: 'default Request Context',
        serviceFee: 0,
        duration: 0,

        //foreign keys
        job: null,
        provider: account,
        requestedBy: account,
        rating: -1,
        profileImageUrl: account.profileImageUrl

    });
    
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([
        '10:00', '10:30', '11:00', '11:30', '12:30',
        '14:30', '15:00', '15:30', '16:00', '16:30'
    ]);

    return (
        <RequestContext.Provider value={{
            requestDetails,
            setRequestDetails,
            selectedTime,
            setSelectedTime,
            selectedDate,
            setSelectedDate,
            availableTimes,
            setAvailableTimes,
            updateRequestDetails(details) {
            },
        }}>
            {children}
        </RequestContext.Provider>
    );
};

export const useRequest = (): RequestContextProps => {
    const context = useContext(RequestContext);
    if (!context) {
        throw new Error('useRequest must be used within a RequestProvider');
    }
    return context;
};