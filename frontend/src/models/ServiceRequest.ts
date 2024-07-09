import { ServiceType, RequestStatus } from "./enums";
import { Job } from "./Job";
import { Account } from "./Account";
import { ServiceOffering } from "./ServiceOffering";
import {Timeslot} from "./Timeslot";


export class ServiceRequest {
    _id: string;
    requestStatus: RequestStatus;
    createdAt: Date; //automatically set by MongoDB
    serviceType: ServiceType;

    // todo: delete
    appointmentStartTime: Date;
    appointmentEndTime: Date | undefined;
    uploads: File[];
    comment: string;
    serviceFee: number;
    duration: number;

    //foreign keys
    job: Job | null;
    serviceOffering: ServiceOffering | undefined | null;   //todo: make it non-null
    provider: Account;
    requestedBy: Account;
    timeslot: Timeslot | undefined;
    rating: number;
    profileImageUrl: string;



    constructor(serviceRequestId: string, requestStatus: RequestStatus, createdOn: Date, serviceType: ServiceType, serviceOffering: ServiceOffering | undefined | null,
        appointmentStartTime: Date,  appointmentEndTime: undefined, uploads: File[], comment: string, serviceFee: number, duration: number, job: Job | null, provider: Account, timeslot: Timeslot|undefined, requestedBy: Account, rating: number,
        profileImageUrl: string) {
        this._id = serviceRequestId;
        this.requestStatus = requestStatus;
        this.createdAt = createdOn;
        this.serviceType = serviceType;
        this.serviceOffering = serviceOffering
        this.appointmentStartTime = appointmentStartTime;
        this.appointmentEndTime = appointmentEndTime;
        this.uploads = uploads;
        this.comment = comment;
        this.serviceFee = serviceFee;
        this.duration = duration;
        this.job = job;
        this.provider = provider;
        this.timeslot = timeslot;
        this.requestedBy = requestedBy;
        this.rating = rating;
        this.profileImageUrl = profileImageUrl;
    }
}