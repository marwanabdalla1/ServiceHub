import { ServiceOffering } from "./ServiceOffering";
import { ServiceRequest } from "./ServiceRequest";
import { Job } from "./Job";


export class Account {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profileImageId?: string;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    location?: string;
    postal?: string;
    isProvider?: boolean;
    isPremium?: boolean;
    isAdmin?:boolean;
    serviceOfferings: ServiceOffering[];
    notifications?: Notification[];
    requestHistory?: ServiceRequest[];
    jobHistory?: Job[];

    constructor(
        _id: string,
        firstName: string,
        lastName: string,
        email: string,
        profileImageId?: string,
        serviceOfferings?: ServiceOffering[],
        phoneNumber?: string,
        address?: string,
        createdAt?: Date,
        updatedAt?: Date,
        description?: string,
        location?: string,
        postal?: string,
        isProvider?: boolean,
        isPremium?: boolean,
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.profileImageId = profileImageId;
        this.description = description;
        this.location = location;
        this.postal = postal;
        this.isProvider = isProvider;
        this.isPremium = isPremium;
        this.serviceOfferings = serviceOfferings || [];
        this.notifications = notifications || [];
        this.requestHistory = requestHistory || [];
        this.jobHistory = jobHistory || [];
    }
}