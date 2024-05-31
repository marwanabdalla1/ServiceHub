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

    //foreign keys
    job: Job | null;
    provider: Account;
    requestedBy: Account;
    //notification is not 

    constructor(serviceRequestId: string, requestStatus: RequestStatus, createdOn: Date, serviceType: ServiceType,
        appointmentTime: Date, uploads: File[], comment: string, job: Job | null, provider: Account, requestedBy: Account) {
        this.serviceRequestId = serviceRequestId;
        this.requestStatus = requestStatus;
        this.createdOn = createdOn;
        this.serviceType = serviceType;
        this.appointmentTime = appointmentTime;
        this.uploads = uploads;
        this.comment = comment;
        this.job = job;
        this.provider = provider;
        this.requestedBy = requestedBy;
    }
}