import mongoose, {Document, Schema, Types} from 'mongoose';

export interface INotification extends Document {
    notificationId: string;
    isViewed: boolean;
    content: string;
    timestamp: Date;
    serviceRequest: Schema.Types.ObjectId; // Reference to a ServiceRequest document
    serviceResponse: Schema.Types.ObjectId; // Reference to a ServiceResponse document
    job: Schema.Types.ObjectId; // Reference to a Job document
}

const NotificationSchema: Schema = new Schema({
    notificationId: {type: String, required: true},
    isViewed: {type: Boolean, required: true},
    content: {type: String, required: true},
    timestamp: {type: Date, required: true},
    serviceRequest: {type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: false},
    serviceResponse: {type: Schema.Types.ObjectId, ref: 'ServiceResponse', required: false},
    job: {type: Schema.Types.ObjectId, ref: 'Job', required: false},
});

export default mongoose.model<INotification>('Notification', NotificationSchema);