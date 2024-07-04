import mongoose, { Document, Schema, Types } from 'mongoose';
import { ServiceType } from './enums';
import {IAccount} from "./account";

export interface IServiceOffering extends Document {
    serviceType: ServiceType;
    lastUpdatedOn: Date;
    createdOn: Date;
    certificateId: string;
    hourlyRate: number;
    description: string;
    isCertified: boolean;
    isCertificateChecked: boolean;
    location: string;
    provider: Types.ObjectId|IAccount // Reference to an Account document
    baseDuration: number;
    bufferTimeDuration: number;
    acceptedPaymentMethods: string[]; // New field for accepted payment methods
    reviews: Types.ObjectId[]; // Reference to Review documents
    rating: number;
    reviewCount: number;
    totalRating: number; //sum of all ratings
}

const ServiceOfferingSchema: Schema = new Schema({
    serviceType: { type: String, enum: Object.values(ServiceType), required: true },
    lastUpdatedOn: { type: Date, required: true },
    // createdOn: { type: Date, required: true },
    certificateId: { type: String, required: false},
    hourlyRate: { type: Number, required: true },
    description: { type: String, required: false },
    isCertified: { type: Boolean, required: false },
    isCertificateChecked: { type: Boolean, required: false },
    location: { type: String, required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    baseDuration: { type: Number, required: true },
    bufferTimeDuration: { type: Number, required: true },
    acceptedPaymentMethods: { type: [String], required: false }, // New field
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review', required: true }],
    rating: { type: Number, required: true },
    totalRating: { type: Number, required: true },
    reviewCount: { type: Number, required: true }
}, { timestamps: true });


export default mongoose.model<IServiceOffering>('ServiceOffering', ServiceOfferingSchema);
