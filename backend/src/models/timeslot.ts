import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeslot extends Document {
    title: string;
    start: Date;
    end: Date;
    isFixed: boolean;
    isBooked: boolean;
    createdById: string;
}

const TimeslotSchema: Schema = new Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    isFixed: { type: Boolean, required: true },
    isBooked: { type: Boolean, required: true },
    createdById: { type: String, required: true }
});

TimeslotSchema.index({ title: 1, start: 1, end: 1, isFixed: 1, isBooked: 1, createdById: 1 }, { unique: true });

const Timeslot = mongoose.model<ITimeslot>('Timeslot', TimeslotSchema);

export default Timeslot;
