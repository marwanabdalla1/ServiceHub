import { Timeslot } from "./Timeslot";
import { Account } from "./Account";
import { ServiceRequest } from "./ServiceRequest";
import { JobStatus, ServiceType } from "./enums";

export class Job {
  jobId: string;
  serviceType: ServiceType; //
  appointmentTime: Date;
  dateOfService: Date;
  serviceFee: string;
  status: JobStatus;
  description: string;
  provider: Account;
  providerImage: string; // Candidate for deletion
  rating: number;

  //foreign keys
  timeOfService: Timeslot;
  request: ServiceRequest;

  constructor(jobId: string, serviceType: ServiceType, dateOfService: Date, serviceFee: string, status: JobStatus,
    description: string, provider: Account, providerImage: string, rating: number, timeOfService: Timeslot, request: ServiceRequest) {
    this.jobId = jobId;
    this.serviceType = serviceType;
    this.appointmentTime = new Date(dateOfService.getFullYear() + "-" + dateOfService.getMonth() + "-" + dateOfService.getDay()
      + "T" + timeOfService.start.getHours() + ":" + timeOfService.start.getMinutes() + ":" + timeOfService.start.getSeconds);
    this.dateOfService = dateOfService;
    this.serviceFee = serviceFee;
    this.status = status;
    this.description = description;
    this.provider = provider;
    this.providerImage = providerImage;
    this.rating = rating;
    this.timeOfService = timeOfService;
    this.request = request;
  }
}
