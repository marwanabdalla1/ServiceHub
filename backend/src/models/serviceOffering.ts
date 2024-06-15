import mongoose, {Document, Schema, Types} from 'mongoose';
import {ServiceType} from './enums';

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
    reviews: Schema.Types.ObjectId[]; // Reference to Review documents
}

const ServiceOfferingSchema: Schema = new Schema({
    serviceOfferingId: {type: String, required: true},
    serviceType: {type: String, enum: Object.values(ServiceType), required: true},
    lastUpdatedOn: {type: Date, required: true},
    createdOn: {type: Date, required: true},
    certificate: {name: String, data: Buffer, contentType: String},
    hourlyRate: {type: Number, required: true},
    description: {type: String, required: true},
    isCertified: {type: Boolean, required: true},
    location: {type: String, required: true},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    baseDuration: {type: Number, required: true},
    bufferTimeDuration: {type: Number, required: true},
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review', required: true}],
});

export default mongoose.model<IServiceOffering>('ServiceOffering', ServiceOfferingSchema);