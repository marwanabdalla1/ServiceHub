import mongoose, {Document, Schema, Types} from 'mongoose';
import {JobStatus, ServiceType} from './enums';

export interface IJob extends Document {
    // jobId: string;
    serviceType: ServiceType;
    appointmentStartTime: Date;
    appointmentEndTime?: Date; //optional
    dateOfService: Date;
    serviceFee: string;
    status: JobStatus;
    description: string | false;
    provider: Types.ObjectId; // Reference to an Account document
    receiver: Types.ObjectId; // Reference to an Account document, the receiver of the job
    providerImage: string;
    ratingForProvider: number | undefined; //probably not needed
    ratingForConsumer: number | undefined; //probably not needed
    // timeOfService: Types.ObjectId; // Reference to a Timeslot document
    request: Types.ObjectId; // Reference to a ServiceRequest document
    serviceOffering: Types.ObjectId;
    // reviews: [Types.ObjectId]; //reference to the reviews, probably not needed
}

const JobSchema: Schema = new Schema({
    // jobId: {type: String, required: true},
    serviceType: {type: String, enum: Object.values(ServiceType), required: true},
    appointmentStartTime: {type: Date, required: true},
    appointmentEndTime: {type: Date, required: false},
    dateOfService: {type: Date, required: false}, //todo: maybe delete this later
    serviceFee: {type: String, required: true},
    status: {type: String, enum: Object.values(JobStatus), required: true},
    description: {type: String, required: false},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    receiver: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    providerImage: {type: String},
    // ratingForProvider: {type: Number, required: false},
    // ratingForConsumer: {type: Number, required: false},
    // timeOfService: {type: Schema.Types.ObjectId, ref: 'Timeslot', required: false}, //todo: maybe change this later
    request: {type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true},
    serviceOffering: {type: Schema.Types.ObjectId, ref: 'ServiceOffering', required: true},
    // reviews: [{type: Schema.Types.ObjectId, ref: 'Review', required: false}],

},{timestamps: true});

export default mongoose.model<IJob>('Job', JobSchema);