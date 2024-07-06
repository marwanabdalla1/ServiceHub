// models/Feedback.ts

export enum ReviewCategory {
    Premium = 'Premium Upgrade',
    Booking = 'Booking',
    UserInterface = 'User Interface',
    CustomerService = 'Customer Service',
    Other = 'Other'
}

export interface Feedback {
    title: string;
    rating: number; // rating is optional
    content: string;
    category: ReviewCategory;
    givenBy: {
        firstName: string
        lastName: string
    }
    createdAt: string;
    updatedAt: string;
}
