import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    phoneNumber: {type: String, required: false},
    address: {type: String, required: false},
    createdOn: {type: Date, required: false, default: Date.now},

    profileImageUrl: String,
    description: String,
    location: String,

    isProvider: {type: Boolean, required: true, default: false},

    isPremium: Boolean,

    serviceOfferings: [{type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOffering'}],
    availability: [{type: mongoose.Schema.Types.ObjectId, ref: 'Availability'}],
    // reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
    notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}],
    requestHistory: [{type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest'}],
    jobHistory: [{type: mongoose.Schema.Types.ObjectId, ref: 'Job'}],
});

const Account = mongoose.model('Account', accountSchema);
export default Account;