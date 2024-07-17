import mongoose, {Document, Schema, Types} from 'mongoose';

export interface IPayment extends Document {
    paymentId: string;
    startsOn: Date;
    endsOn: Date;
    isPaid: boolean;
    isCanceled: boolean;
    provider: Schema.Types.ObjectId; // Reference to an Account document
}

const PaymentSchema: Schema = new Schema({
    paymentId: {type: String, required: true},
    startsOn: {type: Date, required: true},
    endsOn: {type: Date, required: true},
    isPaid: {type: Boolean, required: true},
    isCanceled: {type: Boolean, required: true},
    provider: {type: Schema.Types.ObjectId, ref: 'Account', required: true},
}, {timestamps:true});

export default mongoose.model<IPayment>('Payment', PaymentSchema);