// Define the type for the service object
import {Availability, Review, ServiceOffering} from "./ServiceProviderPreliminary";

export type Service = {
    serviceType: string;
    rating: number;
    hourlyRating: number;
    isLicensed: boolean;
};

// Define the type for the user object
export type User = {
    userId: number;
    firstName: string;
    lastName: string;
    service: Service;
    imageUrl: string;
};

// todo: update this once the service offering etc. are done
export type Account = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    createdOn: Date;
    profileImageUrl: string;
    description: string;
    location: string;

    isProvider: boolean;
    isPremium: boolean;

    serviceOfferings: ServiceOffering[];
    // not sure if it is needed also the jobs and service requests/responses here as attributes
    // or just keep the "account id" as a "foreign key" in those respective tables

    availability: Availability[];

    reviews: Review[];
    rating: number;
    reviewCount: number;

};


export const users: User[] = [
    {
        userId: 1,
        firstName: "John",
        lastName: "Doe",
        service: {
            serviceType: "bikeRepair",
            rating: 4.5,
            hourlyRating: 20.0,
            isLicensed: true,
        },
        imageUrl: "/images/profiles/profile1.png",
    },
    {
        userId: 2,
        firstName: "Jane",
        lastName: "Smith",
        service: {
            serviceType: "houseCleaning",
            rating: 4.8,
            hourlyRating: 25.0,
            isLicensed: true,
        },
        imageUrl: "/images/profiles/profile2.png",
    },
    {
        userId: 3,
        firstName: "Robert",
        lastName: "Brown",
        service: {
            serviceType: "babySitting",
            rating: 4.3,
            hourlyRating: 15.0,
            isLicensed: false,
        },
        imageUrl: "/images/profiles/profile3.png",
    },
    {
        userId: 4,
        firstName: "Emily",
        lastName: "Davis",
        service: {
            serviceType: "tutoring",
            rating: 4.9,
            hourlyRating: 30.0,
            isLicensed: true,
        },
        imageUrl: "/images/profiles/profile4.png",
    },
    {
        userId: 5,
        firstName: "Michael",
        lastName: "Wilson",
        service: {
            serviceType: "petSitting",
            rating: 4.6,
            hourlyRating: 18.0,
            isLicensed: false,
        },
        imageUrl: "/images/profiles/profile5.png",
    },
    {
        userId: 6,
        firstName: "Sarah",
        lastName: "Johnson",
        service: {
            serviceType: "landScaping",
            rating: 4.7,
            hourlyRating: 22.0,
            isLicensed: true,
        },
        imageUrl: "/images/profiles/profile6.png",
    },
    {
        userId: 7,
        firstName: "David",
        lastName: "Williams",
        service: {
            serviceType: "homeRemodeling",
            rating: 4.4,
            hourlyRating: 35.0,
            isLicensed: true,
        },
        imageUrl: "/images/profiles/profile7.png",
    },
    {
        userId: 8,
        firstName: "Ashley",
        lastName: "Jones",
        service: {
            serviceType: "movingServices",
            rating: 4.8,
            hourlyRating: 28.0,
            isLicensed: true,
        },
        imageUrl: "/images/profiles/profile8.png",
    },

    {
        userId: 9,
        firstName: "Bob",
        lastName: "Biker",
        service: {
            serviceType: "bikeRepair",
            rating: 4.7,
            hourlyRating: 25.0,
            isLicensed: true,
        },
        imageUrl: "/images/profiles/profile8.png",
    },

];

const bikeRepairService: ServiceOffering = {
    serviceType: "Bike Repair", //should be enum
    hourlyRate: 50,
    isCertified: false,
};

const babysittingService: ServiceOffering = {
    serviceType: "Babysitting", //should be enum
    hourlyRate: 50,
    isCertified: false,
};

const account: Account = {
    id: "1234325413",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "1234567890",
    address: "123 Main St",
    createdOn: new Date(),
    profileImageUrl: "/images/profiles/profile1.png",
    description: "Professional bike repair service",
    location: "New York, NY",
    isProvider: true,
    isPremium: true,
    serviceOfferings: [],
    availability: [],
    reviews: [],
    rating: 4.5,
    reviewCount: 100,
};
account.serviceOfferings.push(bikeRepairService);
account.serviceOfferings.push(babysittingService);

export default account;
  