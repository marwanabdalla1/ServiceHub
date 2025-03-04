import mongoose, {Document, Schema, Types} from 'mongoose';

export enum ReviewCategory {
    Premium = 'Premium Upgrade',
    Booking = 'Booking',
    UserInterface = 'User Interface',
    CustomerService = 'Customer Service',
    Other = 'Other'
}

export interface IPlatformFeedback extends Document {
    title: string;
    rating: number;
    content: string;
    category: ReviewCategory;
    givenBy: Types.ObjectId;
}

const PlatformFeedbackSchema: Schema = new Schema({
    title: {type: String, required: true},
    rating: {type: Number, required: false},
    content: {type: String, required: true},
    category: {type: String, enum: Object.values(ReviewCategory), required: true},
    givenBy: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
}, {timestamps: true});

export default mongoose.model<IPlatformFeedback>('PlatformFeedback', PlatformFeedbackSchema);
