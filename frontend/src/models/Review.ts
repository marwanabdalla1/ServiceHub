import { starCount } from './enums';
import { Account } from "./Account";
import { ServiceOffering } from './ServiceOffering';

export class Review {
    reviewId: string;
    rating: starCount;
    content: String;
    createdOn: Date;

    // foreign keys
    recipient: Account;
    reviewer: Account;
    service: ServiceOffering;


    constructor(reviewId: string, rating: starCount, content: String, createdOn: Date, recipient: Account, reviewer: Account,
        service: ServiceOffering) {
        this.reviewId = reviewId;
        this.rating = rating;
        this.content = content;
        this.createdOn = createdOn;
        this.recipient = recipient;
        this.reviewer = reviewer;
        this.service = service;
    }
}

