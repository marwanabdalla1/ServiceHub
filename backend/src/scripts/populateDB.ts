import dotenv from 'dotenv';
dotenv.config({path:"../../backend/.env"});

console.log("MongoDB Connection String:", process.env.MONGO_CONNECTION_STRING);


import mongoose, {Schema, Types} from 'mongoose';
import Account from '../models/account';
import ServiceOffering from '../models/serviceOffering';
import Review from '../models/review';
import { ServiceType } from '../models/enums';

const mongoDbUrl = "mongodb+srv://christinayan2001:4tF5iYHRfsKxcqeZ@seba22.rvcgfu0.mongodb.net/ServiceHub?retryWrites=true&w=majority&appName=SEBA22";

if (!mongoDbUrl) {
    console.error('MONGO_CONNECTION_STRING is not defined in the .env file');
    process.exit(1);
}

const mockProviderData = {
    firstName: 'Bob',
    lastName: 'Biker',
    email: 'bob.biker@biking.com',
    password: 'securepassword', // Make sure to hash this in a real application
    phoneNumber: '07775000',
    address: 'Biking Avenue',
    location: 'Munich',
    description: "hi im bob",
    isProvider: true,
    profileImageUrl: '/images/profiles/profile2.png',
    isPremium: false,
    createdOn: new Date('2023-01-01'),
};

const mockServiceOfferingData = {
    serviceType: ServiceType.bikeRepair,
    lastUpdatedOn: new Date('2024-01-01'),
    createdOn: new Date('2023-01-01'),
    certificate: null,
    hourlyRate: 15,
    description: 'Having tinkered with bikes since I was 16, I\'ve got the skills to fix yours up good as new.',
    isCertified: false,
    location: 'Munich',
    baseDuration: 1,
    bufferTimeDuration: 0.5,
    reviews: [] as Types.ObjectId[],
};

const mockReviewData = [
    {
        // reviewId: '1',
        rating: 5,
        content: 'Very friendly, great service. I can definitely recommend!',
        createdOn: new Date('2024-05-03'),
        reviewer: new Types.ObjectId(), // will be set later
        recipient: new Types.ObjectId(), // will be set later
        service: new Types.ObjectId(), // will be set later
    },
    {
        // reviewId: '2',
        rating: 5,
        content: 'Bob is very competent and quick in his work. I will definitely be using him for all my bike repairs from now on.',
        createdOn: new Date('2024-05-03'),
        reviewer: new Types.ObjectId(), // will be set later
        recipient: new Types.ObjectId(), // will be set later
        service: new Types.ObjectId(), // will be set later
    },
    {
        // reviewId: '3',
        rating: 5,
        content: 'Great Service!',
        createdOn: new Date('2024-05-03'),
        reviewer: new Types.ObjectId(), // will be set later
        recipient: new Types.ObjectId(), // will be set later
        service: new Types.ObjectId(), // will be set later
    },
    {
        // reviewId: '4',
        rating: 4,
        content: 'Good',
        createdOn: new Date('2024-05-03'),
        reviewer: new Types.ObjectId(), // will be set later
        recipient: new Types.ObjectId(), // will be set later
        service: new Types.ObjectId(), // will be set later
    },
    {
        // reviewId: '5',
        rating: 4,
        content: 'Good',
        createdOn: new Date('2024-05-03'),
        reviewer: new Types.ObjectId(), // will be set later
        recipient: new Types.ObjectId(), // will be set later
        service: new Types.ObjectId(), // will be set later
    },
];

const populateData = async () => {
    try {
        await mongoose.connect(mongoDbUrl as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as mongoose.ConnectOptions);
        console.log('MongoDB connected');

        const account = new Account(mockProviderData);
        await account.save();

        const serviceOffering = new ServiceOffering({
            ...mockServiceOfferingData,
            provider: account._id as Types.ObjectId,
        });
        await serviceOffering.save();

        for (let reviewData of mockReviewData) {
            reviewData.reviewer = account._id as Types.ObjectId;
            reviewData.recipient = account._id as Types.ObjectId;
            reviewData.service = serviceOffering._id as Types.ObjectId;
            const review = new Review(reviewData);
            await review.save();
            serviceOffering.reviews.push(review._id as Types.ObjectId);
        }

        await serviceOffering.save();

        account.serviceOfferings.push(serviceOffering._id as Types.ObjectId);
        // account.reviews.push(...serviceOffering.reviews);
        await account.save();

        console.log('Data successfully inserted');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error inserting data:', error);
        mongoose.disconnect();
    }
};

populateData();
