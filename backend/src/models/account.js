"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var accountSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    address: { type: String, required: false },
    createdOn: { type: Date, required: false, default: Date.now },
    profileImageUrl: String,
    description: String,
    location: String,
    isProvider: { type: Boolean, required: true, default: false },
    isPremium: Boolean,
    serviceOfferings: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ServiceOffering' }],
    availability: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Availability' }],
    reviews: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Review' }],
    notifications: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Notification' }],
    requestHistory: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ServiceRequest' }],
    jobHistory: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Job' }],
});
var Account = mongoose_1.default.model('Account', accountSchema);
exports.default = Account;
