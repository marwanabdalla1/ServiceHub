import {ServiceType, RequestStatus} from "./enums";
import {Job} from "./Job";
import {Account} from "./Account";
import {ServiceOffering} from "./ServiceOffering";
import {Timeslot} from "./Timeslot";


export class ServiceRequest {
    _id: string;
    requestStatus: RequestStatus;
    serviceType: ServiceType;

    appointmentStartTime?: Date;
    appointmentEndTime?: Date | undefined;
    uploads: File[];
    comment: string;
    serviceFee: number;
    duration: number;

    //foreign keys
    job: Job | null;
    serviceOffering: ServiceOffering | undefined | null;
    provider: Account;
    requestedBy: Account;
    timeslot: Timeslot | undefined;
    updatedAt?: Date;
    createdAt?: Date;


    constructor(serviceRequestId: string, requestStatus: RequestStatus, serviceType: ServiceType, serviceOffering: ServiceOffering | undefined | null,
                appointmentStartTime: Date, appointmentEndTime: undefined, uploads: File[], comment: string, serviceFee: number, duration: number, job: Job | null, provider: Account, timeslot: Timeslot | undefined, requestedBy: Account, updatedAt: Date | undefined, createdAt: Date | undefined) {
        this._id = serviceRequestId;
        this.requestStatus = requestStatus;
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
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;

    }
}