import mongoose, {Document, Schema, Types} from 'mongoose';
import {RequestStatus, ServiceType} from './enums';
import timeslot from "./timeslot";

interface IUpload {
    name: string;
    data: Buffer;
    contentType: string;
}

export interface IServiceRequest extends Document {
    requestStatus: RequestStatus;
    serviceType: ServiceType;
    appointmentStartTime: Date;
    appointmentEndTime: Date;
    uploads: IUpload[] | undefined;
    comment: string | undefined;
    serviceFee: number;
    // duration: number;

    serviceOffering:Types.ObjectId; //reference to the service offering
    job: Types.ObjectId; // Reference to a Job document
    provider:Types.ObjectId; // Reference to an Account document
    requestedBy: Types.ObjectId; // Reference to an Account document
    // rating: number;
    timeslot: Types.ObjectId;
    profileImageUrl: string;
}

const ServiceRequestSchema: Schema = new Schema({
    requestStatus: {type: String, enum: Object.values(RequestStatus), required: true},
    serviceType: {type: String, enum: Object.values(ServiceType), required: true},
    appointmentStartTime: {type: Date, required: true},
    appointmentEndTime: {type: Date, required: true},

    uploads: [{name: String, data: Buffer, contentType: String}],
    comment: {type: String, required: true},
    serviceFee: {type: Number, required: true},
    // duration: {type: Number, required: true}, //or end time
    serviceOffering: {type: Schema.Types.ObjectId, ref: 'ServiceOffering', required: true},
    job: {type: Schema.Types.ObjectId, ref: 'Job', required: false},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    requestedBy: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    timeslot: {type: Schema.Types.ObjectId, ref: 'Timeslot', required: false},
    // rating: {type: Number, required: true}, //todo: is this needed? rating should only be tied with job and not request
    profileImageUrl: {type: String, required: true},
}, {
    timestamps: true // automatically generates created and last updated timestamps
});


export default mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);