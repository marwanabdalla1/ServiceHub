import mongoose, { Document, Schema } from 'mongoose';
import { ServiceType } from './enums';

interface ICertificate {
    name: string;
    data: Buffer;
    contentType: string;
}

export interface IServiceOffering extends Document {
    serviceOfferingId: string;
    serviceType: ServiceType;
    lastUpdatedOn: Date;
    createdOn: Date;
    certificate: ICertificate;
    hourlyRate: number;
    description: string;
    isCertified: boolean;
    location: string;
    provider: Schema.Types.ObjectId; // Reference to an Account document
    baseDuration: number;
    bufferTimeDuration: number;
}

const ServiceOfferingSchema: Schema = new Schema({
    serviceOfferingId: { type: String, required: true },
    serviceType: { type: String, enum: Object.values(ServiceType), required: true },
    lastUpdatedOn: { type: Date, required: true },
    createdOn: { type: Date, required: true },
    certificate: { name: String, data: Buffer, contentType: String },
    hourlyRate: { type: Number, required: true },
    description: { type: String, required: true },
    isCertified: { type: Boolean, required: true },
    location: { type: String, required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Account', required: true }, // Reference to Account document
    baseDuration: { type: Number, required: true },
    bufferTimeDuration: { type: Number, required: true }
});

// TODO Cascade delete service offerings when an account is deleted


export default mongoose.model<IServiceOffering>('ServiceOffering', ServiceOfferingSchema);
