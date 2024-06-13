import mongoose, {Document, Schema, Types} from 'mongoose';
import {starCount} from './enums';

export interface IReview extends Document {
    reviewId: string;
    rating: starCount;
    content: string;
    createdOn: Date;
    recipient: Schema.Types.ObjectId; // Reference to an Account document
    reviewer: Schema.Types.ObjectId; // Reference to an Account document
    service: Schema.Types.ObjectId; // Reference to a ServiceOffering document
}

const ReviewSchema: Schema = new Schema({
    reviewId: {type: String, required: true},
    rating: {type: String, enum: Object.values(starCount), required: true},
    content: {type: String, required: true},
    createdOn: {type: Date, required: true},
    recipient: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    reviewer: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    service: {type: Schema.Types.ObjectId, ref: 'ServiceOffering', required: true},
});

export default mongoose.model<IReview>('Review', ReviewSchema);