import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ReviewCategory {
    Premium = 'Premium Upgrade',
    Booking = 'Booking',
    UserInterface = 'User Interface',
    CustomerService = 'Customer Service',
    Other = 'Other'
}

export interface IPlatformFeedback extends Document {
    rating: number;
    content: string;
    category: ReviewCategory;
    givenBy: Types.ObjectId; // Reference to an Account document
    // Other fields...
}

const PlatformFeedbackSchema: Schema = new Schema({
    rating: { type: Number, required: false },
    content: { type: String, required: true },
    category: { type: String, enum: Object.values(ReviewCategory), required: true },
    givenBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    // Other fields...
}, { timestamps: true });

export default mongoose.model<IPlatformFeedback>('PlatformFeedback', PlatformFeedbackSchema);
