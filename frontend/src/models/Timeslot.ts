import { ServiceType } from "./enums";

export class Timeslot {
    title: ServiceType | string | undefined;
    start: Date;
    end: Date;
    isFixed: boolean;
    isBooked: boolean;
    createdById: string | undefined;
    requestId: string | undefined;

    constructor(title: ServiceType | string | undefined, start: Date, end: Date, isFixed: boolean, isBooked: boolean, requestId: string | undefined, createdBy: string|undefined) {
        this.title = title;
        this.start = start;
        this.end = end;
        this.isFixed = isFixed;
        this.isBooked = isBooked;
        this.createdById = createdBy;
        this.requestId = requestId;

    }
}