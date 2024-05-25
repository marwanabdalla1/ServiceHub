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
