import { ServiceType } from "./enums";

export class Timeslot {
    title: ServiceType | string | undefined;
    start: Date;
    end: Date;
    transitStart: Date | undefined | null;
    transitEnd: Date | null | undefined;
    isFixed: boolean;
    isBooked: boolean;
    createdById: string | undefined;
    requestId: string | undefined;
    jobId: string | undefined;

    constructor(title: ServiceType | string | undefined, start: Date, end: Date, transitStart: Date | undefined | null,
    transitEnd: Date | null | undefined, isFixed: boolean, isBooked: boolean, requestId: string | undefined, jobId: string|undefined, createdBy: string|undefined) {
        this.title = title;
        this.start = start;
        this.end = end;
        this.transitStart = transitStart;
        this.transitEnd = transitEnd;
        this.isFixed = isFixed;
        this.isBooked = isBooked;
        this.createdById = createdBy;
        this.requestId = requestId;
        this.jobId = jobId;

    }
}