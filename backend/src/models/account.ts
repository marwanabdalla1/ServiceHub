import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAccount extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    createdOn: Date;
    profileImageId: string;
    description: string;
    location: string;
    postal: string;
    country: string;
    isProvider: boolean;
    isPremium: boolean;
    stripeId?: string;
    serviceOfferings: Types.ObjectId[]; // Reference to ServiceOffering documents
    availability: Types.ObjectId[];
    reviews: Types.ObjectId[];
    notifications: Types.ObjectId[];
    requestHistory: Types.ObjectId[];
    jobHistory: Types.ObjectId[];
}

const accountSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phoneNumber: { type: String, required: false },
    address: { type: String, required: false },
    postal: { type: String, required: false },
    country: { type: String, required: false },
    stripeId: { type: String, required: false },
    createdOn: { type: Date, required: false, default: Date.now },
    profileImageId: String,
    description: String,
    location: String,
    isProvider: { type: Boolean, required: true, default: false },
    isPremium: Boolean,
    serviceOfferings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOffering' }],
    availability: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Availability' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
    requestHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' }],
    jobHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
});

const Account = mongoose.model<IAccount>('Account', accountSchema);
export default Account;