import { ServiceType } from "./enums";
import { Account } from "./Account";
import { Review } from "./Review";

export type ServiceOffering = {
    serviceOfferingId?: string;
    serviceType: string;
    lastUpdatedOn?: Date;
    createdOn?: Date;
    certificate?: File;
    hourlyRate: number;
    description?: string;
    isCertified?: boolean;
    location?: string;
    providerId?: string;  // Use providerId instead of Account type
    baseDuration?: number;
    bufferTimeDuration?: number;
    reviews?: Review[];
    rating: number;
};




// {
//     userId: 1,
//     firstName: "John",
//     lastName: "Doe",
//     serviceOffering: {
//         serviceType: "bikeRepair",
//         rating: 4.5,
//         hourlyRating: 20.0,
//         isLicensed: true,
//     },
//     imageUrl: "/images/profiles/profile1.png",
// },