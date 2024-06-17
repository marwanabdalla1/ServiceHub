import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAccount extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    createdOn: Date;
    profileImageUrl: string;
    description: string;
    location: string;
    isProvider: boolean;
    isPremium: boolean;
    serviceOfferings: Types.ObjectId[]; // Reference to ServiceOffering documents
}

const accountSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    address: { type: String, required: false },
    createdOn: { type: Date, required: false, default: Date.now },
    profileImageUrl: String,
    description: String,
    location: String,
    isProvider: { type: Boolean, required: true, default: false },
    isPremium: Boolean,
    serviceOfferings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOffering' }]
});

const Account = mongoose.model<IAccount>('Account', accountSchema);
export default Account;
