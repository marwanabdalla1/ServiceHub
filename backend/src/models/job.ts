import mongoose, {Document, Schema, Types} from 'mongoose';
import {JobStatus, ServiceType} from './enums';

export interface IJob extends Document {
    serviceType: ServiceType;
    appointmentStartTime: Date;
    appointmentEndTime?: Date; //optional
    serviceFee: string;
    status: JobStatus;
    comment: string;
    provider: Types.ObjectId;
    receiver: Types.ObjectId;
    providerImage: string;
    request: Types.ObjectId; // Reference to a ServiceRequest document
    serviceOffering: Types.ObjectId;
}

const JobSchema: Schema = new Schema({
    serviceType: {type: String, enum: Object.values(ServiceType), required: true},
    appointmentStartTime: {type: Date, required: true},
    appointmentEndTime: {type: Date, required: false},
    serviceFee: {type: String, required: true},
    status: {type: String, enum: Object.values(JobStatus), required: true},
    description: {type: String, required: false},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    receiver: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    providerImage: {type: String},
    request: {type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true},
    serviceOffering: {type: Schema.Types.ObjectId, ref: 'ServiceOffering', required: true},

},{timestamps: true});

export default mongoose.model<IJob>('Job', JobSchema);