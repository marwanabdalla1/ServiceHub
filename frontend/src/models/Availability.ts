// import {AppointmentModel} from "@devexpress/dx-react-scheduler";
// Import your custom Appointment class and the necessary data.
import { Appointment, appointments as importedAppointments } from './AppointmentModel';
import { User } from "./Account";
import { DaysOfWeek } from "./enums";
import { Timeslot } from "./Timeslot";


// export interface ExtendedAppointment extends AppointmentModel {
//     id: number;
//     title: string;
//     type?: string; // Used for resource coloring or categorization
//     availability?: Availability; // Optional availability data
// }

export class Availability {
    dayOfWeek: DaysOfWeek;
    isFixed: boolean;
    timeslots: Timeslot[];
    constructor(dayOfWeek: DaysOfWeek, isFixed: boolean, timeslots: Timeslot[]) {
        this.dayOfWeek = dayOfWeek;
        this.isFixed = isFixed;
        this.timeslots = timeslots;
    }
};

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
