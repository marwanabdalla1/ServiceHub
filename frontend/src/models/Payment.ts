import { Account } from "./Account";

export class Payment {
    paymentId: string;
    startsOn: Date;
    endsOn: Date;
    isPaid: boolean;
    isCanceled: boolean;
    // timestamp: timestamp;

    //foreign key
    provider: Account;

    constructor(paymentId: string, startsOn: Date, endsOn: Date, isPaid: boolean, isCanceled: boolean, provider: Account) {
        this.paymentId = paymentId;
        this.startsOn = startsOn;
        this.endsOn = endsOn;
        this.isPaid = isPaid;
        this.isCanceled = isCanceled;
        this.provider = provider;
    }
}