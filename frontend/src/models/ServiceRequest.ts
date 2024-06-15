import { ServiceType, RequestStatus } from "./enums";
import { Job } from "./Job";
import { Account } from "./Account";

export class ServiceRequest {
    serviceRequestId: string;
    requestStatus: RequestStatus;
    createdOn: Date;
    serviceType: ServiceType;
    appointmentTime: Date;
    uploads: File[];
    comment: string;
    serviceFee: number;
    duration: number;

    //foreign keys
    job: Job | null;
    provider: Account;
    requestedBy: Account;
    rating: number;
    profileImageUrl: string;


    //notification is not 

    constructor(serviceRequestId: string, requestStatus: RequestStatus, createdOn: Date, serviceType: ServiceType,
        appointmentTime: Date, uploads: File[], comment: string, serviceFee: number, duration: number, job: Job | null, provider: Account, requestedBy: Account, rating: number,
        profileImageUrl: string) {
        this.serviceRequestId = serviceRequestId;
        this.requestStatus = requestStatus;
        this.createdOn = createdOn;
        this.serviceType = serviceType;
        this.appointmentTime = appointmentTime;
        this.uploads = uploads;
        this.comment = comment;
        this.serviceFee = serviceFee;
        this.duration = duration;
        this.job = job;
        this.provider = provider;
        this.requestedBy = requestedBy;
        this.rating = rating;
        this.profileImageUrl = profileImageUrl;
    }
}