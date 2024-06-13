import mongoose, {Document, Schema, Types} from 'mongoose';
import {ResponseStatus} from './enums';

export interface IServiceResponse extends Document {
    serviceResponseId: string;
    responseStatus: ResponseStatus;
    comment: string;
    serviceRequest: Schema.Types.ObjectId; // Reference to a ServiceRequest document
    provider: Schema.Types.ObjectId; // Reference to an Account document
}

const ServiceResponseSchema: Schema = new Schema({
    serviceResponseId: {type: String, required: true},
    responseStatus: {type: String, enum: Object.values(ResponseStatus), required: true},
    comment: {type: String, required: true},
    serviceRequest: {type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
});

export default mongoose.model<IServiceResponse>('ServiceResponse', ServiceResponseSchema);