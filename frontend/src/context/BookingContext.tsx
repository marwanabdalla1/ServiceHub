import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingDetails {
    name: string;
    location: string;
    service: string;
    date: string;
    price: string;
}

interface BookingContextProps {
    bookingDetails: BookingDetails;
    setBookingDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
    selectedTime: string | null;
    setSelectedTime: React.Dispatch<React.SetStateAction<string | null>>;
    selectedDate: string | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
    availableTimes: string[];
    setAvailableTimes: React.Dispatch<React.SetStateAction<string[]>>;
}

const BookingContext = createContext<BookingContextProps | undefined>(undefined);

interface BookingProviderProps {
    children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
        name: 'Bob Biker',
        location: 'Munich',
        service: 'Bike Repair',
        date: 'Sat 11 May 2024 at 15:00',
        price: 'EUR 15 per hour',
    });
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([
        '10:00', '10:30', '11:00', '11:30', '12:30',
        '14:30', '15:00', '15:30', '16:00', '16:30'
    ]);

    return (
        <BookingContext.Provider value={{
            bookingDetails,
            setBookingDetails,
            selectedTime,
            setSelectedTime,
            selectedDate,
            setSelectedDate,
            availableTimes,
            setAvailableTimes
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