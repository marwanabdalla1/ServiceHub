import mongoose, {Document, Schema, Types} from 'mongoose';

export interface IAccount extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    profileImageId: string;
    description: string;
    location: string;
    postal: string;
    isProvider: boolean;
    isPremium: boolean;
    isAdmin: boolean;
    stripeId?: string;
    serviceOfferings: Types.ObjectId[];
    notifications: Types.ObjectId[];
    requestHistory: Types.ObjectId[];
    jobHistory: Types.ObjectId[];
}

const accountSchema: Schema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, select: true},
    phoneNumber: {type: String, required: false},
    address: {type: String, required: false},
    postal: {type: String, required: false},
    stripeId: {type: String, required: false},
    profileImageId: String,
    description: String,
    location: String,
    isProvider: {type: Boolean, required: true, default: false},
    isPremium: Boolean,
    isAdmin: Boolean,
    serviceOfferings: [{type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOffering'}],
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}],
    requestHistory: [{type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest'}],
    jobHistory: [{type: mongoose.Schema.Types.ObjectId, ref: 'Job'}],
}, {timestamps: true});

const Account = mongoose.model<IAccount>('Account', accountSchema);
export default Account;