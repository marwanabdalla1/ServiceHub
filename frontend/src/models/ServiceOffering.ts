import { ServiceType } from "./enums";
import { Account } from "./Account";
import { Review } from "./Review";

export class ServiceOffering {
    serviceOfferingId: string;
    serviceType: ServiceType;
    lastUpdatedOn: Date;
    createdOn: Date;
    certificate: File;
    hourlyRate: number;
    description: string;
    isCertified: boolean;
    location: string;
    provider: Account;
    baseDuration: number;
    bufferTimeDuration: number;
    reviews: Review[];


    constructor(serviceOfferingId: string, serviceType: ServiceType, lastUpdatedOn: Date, createdOn: Date,
        certificate: File, hourlyRate: number, description: string, isCertified: boolean, location: string,
        provider: Account, baseDuration: number, bufferTimeDuration: number, reviews: Review[]) {
        this.serviceOfferingId = serviceOfferingId;
        this.serviceType = serviceType;
        this.lastUpdatedOn = lastUpdatedOn;
        this.createdOn = createdOn;
        this.certificate = certificate;
        this.hourlyRate = hourlyRate;
        this.description = description;
        this.isCertified = isCertified;
        this.location = location;
        this.provider = provider;
        this.baseDuration = baseDuration;
        this.bufferTimeDuration = bufferTimeDuration;
        this.reviews = reviews;
    }
}