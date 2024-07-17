import mongoose, {Schema, Document, Types} from 'mongoose';

export interface ITimeslot extends Document {
    title: string;
    start: Date;
    end: Date;
    transitStart?: Date;
    transitEnd?: Date;
    isFixed: boolean;
    isBooked: boolean;
    requestId?: Types.ObjectId;
    jobId?: Types.ObjectId;
    createdById: Types.ObjectId;
}

const TimeslotSchema: Schema = new Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    transitStart: { type: Date, required: false },
    transitEnd: { type: Date, required: false },
    isFixed: { type: Boolean, required: true },
    isBooked: { type: Boolean, required: true },
    requestId: { type: Schema.Types.ObjectId, ref: "ServiceRequest", required: false, unique:true  }, //only required if it is booked
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: false, unique:true  }, //only required if it is booked
    createdById: { type: Schema.Types.ObjectId, ref: "Account", required: true },

}, {timestamps: true});


const Timeslot = mongoose.model<ITimeslot>('Timeslot', TimeslotSchema);

export default Timeslot;
