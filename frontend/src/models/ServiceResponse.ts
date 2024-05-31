import { ResponseStatus } from "./enums";
import { ServiceRequest } from "./ServiceRequest";
import { Account } from "./Account";

export class ServiceResponse {
    serviceResponseId: string;
    responseStatus: ResponseStatus;
    comment: string;

    //foreign keys
    serviceRequest: ServiceRequest;
    provider: Account | null;

    constructor(serviceResponseId: string, responseStatus: ResponseStatus, comment: string, serviceRequest: ServiceRequest,
        provider: Account | null) {
        this.serviceResponseId = serviceResponseId;
        this.responseStatus = responseStatus;
        this.comment = comment;
        this.serviceRequest = serviceRequest;
        this.provider = provider;
    }
}