import {AppointmentModel} from "@devexpress/dx-react-scheduler";
// Import your custom Appointment class and the necessary data.
import { Appointment, appointments as importedAppointments } from './AppointmentModel';
import {User} from "./User";

export enum DaysOfWeek {
    Sunday,    // 0
    Monday,    // 1
    Tuesday,   // 2
    Wednesday, // 3
    Thursday,  // 4
    Friday,    // 5
    Saturday   // 6
}

export type Availability = {
    dayOfWeek: DaysOfWeek;
    isFixed: boolean;
    timeslots: Timeslot[];
};

export type Timeslot = {
    start: Date;
    end: Date;
};


export interface ExtendedAppointment extends AppointmentModel {
    id: number;
    title: string;
    type?: string; // Used for resource coloring or categorization
    availability?: Availability; // Optional availability data
}




export interface SchedulerAppointment {
    id: number;
    startDate: Date;
    endDate: Date;
    title: string;
    type?: string;
    user?: User;
    service?: string;
    bookingRef?: string;
}

export const mapAppointmentsToScheduler = (appointments: Appointment[]): SchedulerAppointment[] => {
    return appointments.map((appointment, index) => ({
        id: index,
        startDate: new Date(appointment.date), // Assuming appointment.date is the start date
        endDate: new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000), // adding 1 hour by default
        title: appointment.service,
        user: appointment.user,
        service: appointment.service,
        bookingRef: appointment.bookingRef
    }));
};
