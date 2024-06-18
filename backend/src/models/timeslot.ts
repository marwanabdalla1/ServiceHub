import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeslot extends Document {
  title: string; // Changed to string
  start: Date;
  end: Date;
  isFixed: boolean;
  isBooked: boolean;  
  createdById: string;

}

const TimeSlot: Schema = new Schema({
  title: {
    type: String,
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
  },
  isBooked: {
    type: Boolean,
    required: true
  },
  createdById: {
    type: String,
    required: true
  }
});

export default mongoose.model<ITimeslot>('Timeslot', TimeSlot);