import mongoose, {Document, Schema, Types} from 'mongoose';
import { NotificationType } from './enums';
export interface INotification extends Document {
    isViewed: boolean;
    // notificationType:
    // new request/new job/ (job/request) status changed/ new review/ change time request from provider etc.
    notificationType: NotificationType ;
    content: string;
    serviceRequest?: Types.ObjectId; // Reference to a ServiceRequest document
    // serviceResponse: Types.ObjectId; // Reference to a ServiceResponse document
    job?: Types.ObjectId; // Reference to a Job document
    review?: Types.ObjectId;
    // potentially: triggeredBy
    recipient: Types.ObjectId
}

const NotificationSchema: Schema = new Schema({
    isViewed: {type: Boolean, required: true},
    content: {type: String, required: true},
    serviceRequest: {type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: false},
    // serviceResponse: {type: Schema.Types.ObjectId, ref: 'ServiceResponse', required: false},
    job: {type: Schema.Types.ObjectId, ref: 'Job', required: false},
    review: {type: Schema.Types.ObjectId, ref: 'Review', required: false},
    recipient: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
    notificationType: {type: String, required: true}
}, {timestamps: true});

export default mongoose.model<INotification>('Notification', NotificationSchema);