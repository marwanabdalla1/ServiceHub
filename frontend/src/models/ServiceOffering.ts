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
