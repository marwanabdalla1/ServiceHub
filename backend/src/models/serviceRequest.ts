import mongoose, {Document, Schema, Types} from 'mongoose';
import {RequestStatus, ServiceType} from './enums';

interface IUpload {
    name: string;
    data: Buffer;
    contentType: string;
}

export interface IServiceRequest extends Document {
    serviceRequestId: string;
    requestStatus: RequestStatus;
    createdOn: Date;
    serviceType: ServiceType;
    appointmentTime: Date;
    uploads: IUpload[];
    comment: string;
    serviceFee: number;
    duration: number;

    serviceOffering: Schema.Types.ObjectId; //reference to the service ofering
    job: Schema.Types.ObjectId; // Reference to a Job document
    provider: Schema.Types.ObjectId; // Reference to an Account document
    requestedBy: Schema.Types.ObjectId; // Reference to an Account document
    rating: number;
    profileImageUrl: string;
}

const ServiceRequestSchema: Schema = new Schema({
    serviceRequestId: {type: String, required: true},
    requestStatus: {type: String, enum: Object.values(RequestStatus), required: true},
    createdOn: {type: Date, required: true},
    serviceType: {type: String, enum: Object.values(ServiceType), required: true},
    appointmentTime: {type: Date, required: true},
    uploads: [{name: String, data: Buffer, contentType: String}],
    comment: {type: String, required: true},
    serviceFee: {type: Number, required: true},
    duration: {type: Number, required: true},
    serviceOffering: {type: Schema.Types.ObjectId, ref: 'ServiceOffering', required: true},
    job: {type: Schema.Types.ObjectId, ref: 'Job', required: true},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    requestedBy: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    rating: {type: Number, required: true}, //todo: is this needed? rating should only be tied with job and not request
    profileImageUrl: {type: String, required: true},
});

export default mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);