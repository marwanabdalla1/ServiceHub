export enum DaysOfWeek {
    Sunday,    // 0
    Monday,    // 1
    Tuesday,   // 2
    Wednesday, // 3
    Thursday,  // 4
    Friday,    // 5
    Saturday   // 6
}

export type Review = {
    id: string;
    rating: number;
    content: string;
    createdOn: string;
    reviewer: string;
};

export type ServiceOffering = {
    serviceType: string; //should be enum
    hourlyRate: number;
    isCertified: boolean;
};

export type Availability = {
    dayOfWeek: DaysOfWeek;
    isFixed: boolean;
    timeslots: Timeslot[];
};

export type Timeslot = {
    start: Date;
    end: Date;
};

export type ServiceProvider = {
    id: string;
    firstName: string;
    lastName: string;
    service: ServiceOffering;
    location: string;
    availability: Availability[];
    reviews: Review[];
    rating: number;
    reviewCount: number;
    description: string;
};
