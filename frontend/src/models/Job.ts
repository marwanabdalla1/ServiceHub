import { Timeslot } from "./Timeslot";
import { Account } from "./Account";
import { ServiceRequest } from "./ServiceRequest";
import { JobStatus, ServiceType } from "./enums";
import {ServiceOffering} from "./ServiceOffering";

export class Job {
  _id: string;
  serviceType: ServiceType; //
  appointmentStartTime: Date;
  appointmentEndTime: Date | undefined;

  // dateOfService: Date; //not needed!
  serviceFee: string;
  status: JobStatus;
  description: string;
  provider: Account;
  receiver: Account;
  providerImage: string; // Candidate for deletion
  rating: number;

  //foreign keys
  timeOfService: Timeslot | undefined; //todo: edit this once calendar is done
  request: ServiceRequest | undefined;
  serviceOffering: ServiceOffering | undefined;

  constructor(jobId: string, serviceType: ServiceType, appointmentStartTime: Date, appointmentEndTime: Date, serviceFee: string, status: JobStatus,
    description: string, provider: Account, receiver:Account, providerImage: string, rating: number, timeOfService: Timeslot, request: ServiceRequest, serviceOffering: ServiceOffering | undefined) {
    this._id = jobId;
    this.serviceType = serviceType;
    // this.appointmentStartTime = new Date(dateOfService.getFullYear() + "-" + dateOfService.getMonth() + "-" + dateOfService.getDay()
    //   + "T" + timeOfService.start.getHours() + ":" + timeOfService.start.getMinutes() + ":" + timeOfService.start.getSeconds);
    this.appointmentStartTime = appointmentStartTime;
    this.appointmentEndTime = appointmentEndTime; //todo: update this to actual service time
    // this.dateOfService = dateOfService;
    this.serviceFee = serviceFee;
    this.status = status;
    this.description = description;
    this.provider = provider;
    this.receiver = receiver;
    this.providerImage = providerImage;
    this.rating = rating;
    this.timeOfService = timeOfService;
    this.request = request;
    this.serviceOffering = serviceOffering;
  }
}
