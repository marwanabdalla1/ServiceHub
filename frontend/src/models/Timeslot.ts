import { ServiceType } from "./enums";

export class Timeslot {
    title: ServiceType;
    start: Date;
    end: Date;
    isFixed: boolean;

    constructor(title: ServiceType, start: Date, end: Date, isFixed: boolean) {
        this.title = title;
        this.start = start;
        this.end = end;
        this.isFixed = isFixed;

    }
}