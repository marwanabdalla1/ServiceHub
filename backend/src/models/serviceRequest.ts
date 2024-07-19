import mongoose, {Document, Schema, Types} from 'mongoose';
import {RequestStatus, ServiceType} from './enums';

interface IUpload {
    name: string;
    data: Buffer;
    contentType: string;
}

export interface IServiceRequest extends Document {
    requestStatus: RequestStatus;
    serviceType: ServiceType;
    appointmentStartTime: Date;
    appointmentEndTime?: Date;
    uploads: IUpload[] | undefined;
    comment: string | undefined;
    serviceFee: number;

    serviceOffering: Types.ObjectId;
    job: Types.ObjectId;
    provider: Types.ObjectId;
    requestedBy: Types.ObjectId;

}

const ServiceRequestSchema: Schema = new Schema({
    requestStatus: {type: String, enum: Object.values(RequestStatus), required: true},
    serviceType: {type: String, enum: Object.values(ServiceType), required: true},
    appointmentStartTime: {type: Date, required: true},
    appointmentEndTime: {type: Date, required: false},

    uploads: [{name: String, data: Buffer, contentType: String}],
    comment: {type: String, required: false},
    serviceFee: {type: Number, required: true},
    serviceOffering: {type: Schema.Types.ObjectId, ref: 'ServiceOffering', required: true},
    job: {type: Schema.Types.ObjectId, ref: 'Job', required: false},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    requestedBy: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
}, {
    timestamps: true // automatically generates created and last updated timestamps
});


export default mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);