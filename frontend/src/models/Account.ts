//Define the type for the service object
import { Review } from "./Review";
import { ServiceOffering } from "./ServiceOffering";
import { ServiceType } from "./enums";
import { ServiceRequest } from "./ServiceRequest";
import { Job } from "./Job";
import { Availability } from "./Availability";

//Candidate for deletion
export type Service = {
    serviceType: string;
    rating: number;
    hourlyRating: number;
    isLicensed: boolean;
};

// TODO: Candidate for deletion as it is not used
// Define the type for the user object
export type User = {
    userId: number;
    firstName: string;
    lastName: string;
    service: Service;
    imageUrl: string;
};


export class Account {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profileImageId?: string;
    address?: string;
    createdOn?: Date;
    profileImageUrl?: string;
    description?: string;
    location?: string;
    postal?: string;
    country?: string;
    isProvider?: boolean;
    isPremium?: boolean;
    isAdmin?:boolean;
    rating?: number;
    reviewCount?: number;
    serviceOfferings: ServiceOffering[];
    availability?: Availability[];
    reviews?: Review[];
    notifications?: Notification[];
    requestHistory?: ServiceRequest[];
    jobHistory?: Job[];

    constructor(
        _id: string,
        firstName: string,
        lastName: string,
        email: string,
        profileImageUrl?: string,
        profileImageId?: string,
        rating?: number,
        serviceOfferings?: ServiceOffering[],
        phoneNumber?: string,
        address?: string,
        createdOn?: Date,
        description?: string,
        location?: string,
        country?:string,
        postal?: string,
        isProvider?: boolean,
        isPremium?: boolean,
        reviewCount?: number,
        availability?: Availability[],
        reviews?: Review[],
        notifications?: Notification[],
        requestHistory?: ServiceRequest[],
        jobHistory?: Job[]
    ) {
        this._id = _id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.createdOn = createdOn;
        this.profileImageUrl = profileImageUrl;
        this.profileImageId = profileImageId;
        this.description = description;
        this.location = location;
        this.country = country;
        this.postal = postal;
        this.isProvider = isProvider;
        this.isPremium = isPremium;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.serviceOfferings = serviceOfferings || [];
        this.availability = availability || [];
        this.reviews = reviews || [];
        this.notifications = notifications || [];
        this.requestHistory = requestHistory || [];
        this.jobHistory = jobHistory || [];
    }
}

// export type Account = {
//     id: string;
//     firstName: string;
//     lastName: string;
//     email?: string;
//     phoneNumber?: string;
//     address?: string;
//     createdOn?: Date;
//     profileImageUrl?: string;
//     description?: string;
//     location?: string;
//     isProvider: boolean;
//     isPremium?: boolean;
//     rating: number;
//     reviewCount?: number;
//     serviceOfferings?: ServiceOffering[];
//     availability?: Availability[];
//     reviews?: Review[];
//     notifications?: Notification[];
//     requestHistory?: ServiceRequest[];
//     jobHistory?: Job[];
// };




//Test-data to be removed, simply maintained in case required by original developer
// const account: Account = {
//     _id: "1234325413",
//     firstName: "John",
//     lastName: "Doe",
//     email: "john.doe@example.com",
//     phoneNumber: "1234567890",
//     address: "123 Main St",
//     createdOn: new Date(),
//     profileImageUrl: "/images/profiles/profile1.png",
//     description: "Professional bike repair service",
//     location: "New York",
//     postal: "12344",
//     country: "USA",
//     isProvider: false,
//     isPremium: true,
//     serviceOfferings: [],
//     availability: [],
//     reviews: [],
//     requestHistory: [],
//     jobHistory: [],
//     notifications: [],
//     rating: 4.5,
//     reviewCount: 100,
// };
//
//
// // Test-data to be removed, simply maintained in case required by original developer
// export const bikeRepairService: ServiceOffering = {
//     _id: "bikeRepair0",
//     serviceType: ServiceType.bikeRepair,
//     description: "description0",
//     location: "location0",
//     hourlyRate: 50,
//     isCertified: false,
//     createdOn: new Date(),
//     lastUpdatedOn: new Date(),
//     certificate: new File([], "empty.txt", { type: "text/plain" }),
//     baseDuration: 2,
//     bufferTimeDuration: 0.5,
//     reviews: [],
//     rating: 4.5,
//     reviewCount: 2,
//     provider: account
//
// };
//
// // Test-data to be removed, simply maintained in case required by original developer
// export const babysittingService: ServiceOffering = {
//     _id: "babySitting0",
//     serviceType: ServiceType.babySitting,
//     description: "description1",
//     location: "location1",
//     hourlyRate: 50,
//     isCertified: false,
//     createdOn: new Date(),
//     lastUpdatedOn: new Date(),
//     certificate: new File([], "empty.txt", { type: "text/plain" }),
//     baseDuration: 2,
//     bufferTimeDuration: 0.5,
//     reviews: [],
//     reviewCount: 2,
//     rating: 4.5,
//     provider: account
// };
//
// // Test-data to be removed, simply maintained in case required by original developer
// account.serviceOfferings.push(bikeRepairService);
// account.serviceOfferings.push(babysittingService);
//
// export default account;
//
// export const users: Account[] = [
//     {
//         _id: "1",
//         firstName: "John",
//         lastName: "Doe",
//         email: "john.doe@mail.com",
//         phoneNumber: "1234567890",
//         address: "123 Main St",
//         createdOn: new Date(),
//         profileImageUrl: "/images/profiles/profile1.png",
//         description: "Professional bike repair service",
//         location: "New York, NY",
//         isProvider: false,
//         isPremium: true,
//         serviceOfferings: [bikeRepairService],
//         availability: [],
//         reviews: [],
//         requestHistory: [],
//         jobHistory: [],
//         notifications: [],
//         rating: 4.5,
//         reviewCount: 100,
//     },
//     {
//         _id: "2",
//         firstName: "Jane",
//         lastName: "Smith",
//         email: "jane.smith@mail.com",
//         phoneNumber: "1234567890",
//         address: "123 Main St",
//         createdOn: new Date(),
//         profileImageUrl: "/images/profiles/profile2.png",
//         description: "House cleaning service",
//         location: "New York, NY",
//         isProvider: false,
//         isPremium: true,
//         serviceOfferings: [babysittingService],
//         availability: [],
//         reviews: [],
//         requestHistory: [],
//         jobHistory: [],
//         notifications: [],
//         rating: 4.8,
//         reviewCount: 100,
//     },
//     {
//         _id: "3",
//         firstName: "Robert",
//         lastName: "Brown",
//         email: "robert.brown@mail.com",
//         phoneNumber: "1234567890",
//         address: "123 Main St",
//         createdOn: new Date(),
//         profileImageUrl: "/images/profiles/profile3.png",
//         description: "House cleaning service",
//         location: "New York, NY",
//         isProvider: false,
//         isPremium: true,
//         serviceOfferings: [babysittingService],
//         availability: [],
//         reviews: [],
//         requestHistory: [],
//         jobHistory: [],
//         notifications: [],
//         rating: 4.8,
//         reviewCount: 100,
//     },
/*
    {
        id: "4",
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
        id: "5",
        firstName: "Michael",
        lastName: "Wilson",
        email: "michael.wilson@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile5.png",
        description: "Pet sitting service",
        location: "New York, NY",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "petSitting0",
                serviceType: ServiceType.petSitting,
                description: "description3",
                location: "location3",
                hourlyRate: 18,
                isCertified: false,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: new File([], "empty.txt", { type: "text/plain" }),
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                reviews: [],
                rating: 4.6,
                provider: account
            }
        ],
        availability: [],
        reviews: [],
        requestHistory: [],
        jobHistory: [],
        notifications: [],
        rating: 4.6,
        reviewCount: 100,
    },
    {
        id: "6",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile6.png",
        description: "Landscaping service",
        location: "New York, NY",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "landscaping0",
                serviceType: ServiceType.landscapingServices,
                description: "description4",
                location: "location4",
                hourlyRate: 22,
                isCertified: true,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: new File([], "empty.txt", { type: "text/plain" }),
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                reviews: [],
                rating: 4.7,
                provider: account
            }
        ],
        availability: [],
        reviews: [],
        requestHistory: [],
        jobHistory: [],
        notifications: [],
        rating: 4.7,
        reviewCount: 100,
    },
    {
        id: "7",
        firstName: "David",
        lastName: "Williams",
        email: "david.williams@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile7.png",
        description: "Home remodeling service",
        location: "New York, NY",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "homeRemodeling0",
                serviceType: ServiceType.homeRemodeling,
                description: "description5",
                location: "location5",
                hourlyRate: 35,
                isCertified: true,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: new File([], "empty.txt", { type: "text/plain" }),
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                reviews: [],
                rating: 4.4,
                provider: account
            }
        ],
        availability: [],
        reviews: [],
        requestHistory: [],
        jobHistory: [],
        notifications: [],
        rating: 4.4,
        reviewCount: 100,
    },
    {
        id: "8",
        firstName: "Ashley",
        lastName: "Jones",
        email: "ashley.jones@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile8.png",
        description: "Moving services",
        location: "New York, NY",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "movingServices0",
                serviceType: ServiceType.movingServices,
                description: "description6",
                location: "location6",
                hourlyRate: 28,
                isCertified: true,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: new File([], "empty.txt", { type: "text/plain" }),
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                reviews: [],
                rating: 4.8,
                provider: account
            }
        ],
        availability: [],
        reviews: [],
        requestHistory: [],
        jobHistory: [],
        notifications: [],
        rating: 4.8,
        reviewCount: 100,
    },
    {
        id: "9",
        firstName: "Bob",
        lastName: "Biker",
        email: "bob.biker@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile9.png",
        description: "Bike repair service",
        location: "New York, NY",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [bikeRepairService],
        availability: [],
        reviews: [],
        requestHistory: [],
        jobHistory: [],
        notifications: [],
        rating: 4.7,
        reviewCount: 100,
    },*/
// ];
