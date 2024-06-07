import { Job } from "./Job";
import { ServiceRequest } from "./ServiceRequest";
import { ServiceResponse } from "./ServiceResponse";

export class Notification {
    notificationId: string;
    isViewed: boolean;
    content: string;
    timestamp: Date;

    //foreign keys
    serviceRequest: ServiceRequest | null;
    serviceResponse: ServiceResponse | null;
    job: Job | null;

    constructor(notificationId: string, isViewed: boolean, content: string, serviceRequest: ServiceRequest | null,
        serviceResponse: ServiceResponse | null, job: Job | null) {
        this.notificationId = notificationId;
        this.isViewed = isViewed;
        this.content = content;
        this.timestamp = new Date();
        this.serviceRequest = serviceRequest;
        this.serviceResponse = serviceResponse;
        this.job = job;
    }
}
