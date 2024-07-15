import { starCount } from './enums';
import { Account } from "./Account";
import { ServiceOffering } from './ServiceOffering';

export class Review {
    _id: string;
    rating: starCount;
    content: String;
    createdAt: Date;
    updatedAt: Date;


    // foreign keys
    recipient: Account;
    reviewer: Account;
    service: ServiceOffering;


    constructor(reviewId: string, rating: starCount, content: String, createdAt: Date, updatedAt: Date, recipient: Account, reviewer: Account,
        service: ServiceOffering) {
        this._id = reviewId;
        this.rating = rating;
        this.content = content;
        this.createdAt = createdAt;
        this.recipient = recipient;
        this.updatedAt = updatedAt
        this.reviewer = reviewer;
        this.service = service;
    }
}

