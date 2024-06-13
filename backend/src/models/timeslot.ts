import mongoose, {Document, Schema} from 'mongoose';
import {ServiceType} from './enums';

export interface ITimeslot extends Document {
    title: ServiceType;
    start: Date;
    end: Date;
    isFixed: boolean;
}

const TimeslotSchema: Schema = new Schema({
    title: {
        type: String,
        enum: Object.values(ServiceType),
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    isFixed: {
        type: Boolean,
        required: true
    }
});

export default mongoose.model<ITimeslot>('Timeslot', TimeslotSchema);