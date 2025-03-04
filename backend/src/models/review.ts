import mongoose, {Document, Schema, Types} from 'mongoose';

export interface IReview extends Document {
    rating: number;
    content: string;
    recipient: Types.ObjectId; // Reference to an Account document
    reviewer: Types.ObjectId; // Reference to an Account document
    serviceOffering: Types.ObjectId; // Reference to a ServiceOffering document
    job: Types.ObjectId; //the carried out job linked to this review
}

const ReviewSchema: Schema = new Schema({
    rating: {type: Number, required: true},
    content: {type: String, required: true, default: ''},
    recipient: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    reviewer: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    serviceOffering: {type: Schema.Types.ObjectId, ref: 'ServiceOffering', required: true},
    job: {type: Schema.Types.ObjectId, ref: 'Job', required: true},

}, {timestamps: true});

export default mongoose.model<IReview>('Review', ReviewSchema);