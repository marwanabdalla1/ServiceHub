import mongoose, {Document, Schema} from 'mongoose';
import {JobStatus, ServiceType} from './enums';

export interface IJob extends Document {
    jobId: string;
    serviceType: ServiceType;
    appointmentTime: Date;
    dateOfService: Date;
    serviceFee: string;
    status: JobStatus;
    description: string;
    provider: Schema.Types.ObjectId; // Reference to an Account document
    providerImage: string;
    rating: number;
    timeOfService: Schema.Types.ObjectId; // Reference to a Timeslot document
    request: Schema.Types.ObjectId; // Reference to a ServiceRequest document
}

const JobSchema: Schema = new Schema({
    jobId: {type: String, required: true},
    serviceType: {type: String, enum: Object.values(ServiceType), required: true},
    appointmentTime: {type: Date, required: true},
    dateOfService: {type: Date, required: true},
    serviceFee: {type: String, required: true},
    status: {type: String, enum: Object.values(JobStatus), required: true},
    description: {type: String, required: true},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    providerImage: {type: String},
    rating: {type: Number, required: true},
    timeOfService: {type: Schema.Types.ObjectId, ref: 'Timeslot', required: true},
    request: {type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true},
});

export default mongoose.model<IJob>('Job', JobSchema);