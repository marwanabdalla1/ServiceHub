import { Account as User } from './Account';

export class Appointment {
    date: string;
    user: User; // TODO: should change to Account? -> User will be deleted
    service: string;
    bookingRef: string;

    constructor(date: string, user: User, service: string, bookingRef: string) {
        this.date = date;
        this.user = user;
        this.service = service;
        this.bookingRef = bookingRef;
    }
}

// export const appointments: Appointment[] = users.slice(0, 4).map((user, index) => {
//     const date = new Date();
//     date.setDate(date.getDate() + index * 7); // Set the date of each appointment to be a week apart //why is it index *7 and not +7?
//     const bookingRef = `65742695-${index}`; // Generate a unique booking reference for each appointment
//     return new Appointment(date.toISOString(), user, user.serviceOfferings[0].serviceType, bookingRef);
// });

// Find the user Bob Biker
// const bobBiker = users[0];

// Create a new appointment for Bob Biker
// export const bobBikerAppointment = new Appointment(
//     new Date('2024-05-11T15:00:00').toISOString(), // Sat 11 May 2024 at 15:00
//     bobBiker,
//     bobBiker.serviceOfferings[0].serviceType,
//     '65742695' // Booking ref #: 65742695
// );


