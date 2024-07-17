import { ServiceType } from "./enums";
import { Account } from "./Account";
import { Review } from "./Review";

export class ServiceOffering {
    _id: string;
    serviceType: ServiceType;
    updatedAt: Date;
    createdAt: Date;
    certificate: File | null;
    hourlyRate: number;
    description: string;
    isCertified: boolean;
    location: string;
    provider: Account;
    acceptedPaymentMethods: string[]; // New field for accepted payment methods
    baseDuration: number;
    bufferTimeDuration: number;
    reviews: Review[];
    reviewCount: number;
    rating: number;


    constructor(serviceOfferingId: string, serviceType: ServiceType, updatedAt: Date, createdAt: Date,
        certificate: File | null, hourlyRate: number, description: string, isCertified: boolean, location: string,
        provider: Account, baseDuration: number, bufferTimeDuration: number, reviews: Review[], acceptedPaymentMethods: string[], reviewCount: number, rating: number) {
        this._id = serviceOfferingId;
        this.serviceType = serviceType;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
        this.certificate = certificate;
        this.hourlyRate = hourlyRate;
        this.description = description;
        this.isCertified = isCertified;
        this.location = location;
        this.provider = provider;
        this.baseDuration = baseDuration;
        this.bufferTimeDuration = bufferTimeDuration;
        this.acceptedPaymentMethods = acceptedPaymentMethods; // New field for accepted payment methods
        this.reviews = reviews;
        this.reviewCount = reviewCount;
        this.rating = rating;
    }
}