import { User, users } from './User';

export class Appointment {
    date: string;
    user: User;
    service: string;
    bookingRef: string;

    constructor(date: string, user: User, service: string, bookingRef: string) {
        this.date = date;
        this.user = user;
        this.service = service;
        this.bookingRef = bookingRef;
    }
}

export const appointments: Appointment[] = users.slice(0, 4).map((user, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index * 7); // Set the date of each appointment to be a week apart
    const bookingRef = `65742695-${index}`; // Generate a unique booking reference for each appointment
    return new Appointment(date.toISOString(), user, user.service.serviceType, bookingRef);
});

// Find the user Bob Biker
const bobBiker = users[8];

// Create a new appointment for Bob Biker
export const bobBikerAppointment = new Appointment(
    new Date('2024-05-11T15:00:00').toISOString(), // Sat 11 May 2024 at 15:00
    bobBiker,
    bobBiker.service.serviceType,
    '65742695' // Booking ref #: 65742695
);


