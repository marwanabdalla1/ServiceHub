import mongoose from 'mongoose';
import * as faker from 'faker';
import bcrypt from 'bcrypt';
import Account, {IAccount} from "../models/account";
import ServiceOffering, {IServiceOffering} from "../models/serviceOffering";

// Assuming User and ServiceOffering models are set for Account and ServiceOffering respectively

// Define the ServiceType enum
enum ServiceType {
    BikeRepair = "Bike Repair",
    HouseCleaning = "House Cleaning",
    Babysitting = "Babysitting",
    Tutoring = "Tutoring",
    Petsitting = "Petsitting",
    LandscapingServices = "Landscaping Services",
    HomeRemodeling = "Home Remodeling",
    MovingServices = "Moving Services",
}
const serviceTypes = Object.values(ServiceType) as string[];

const mongoDbUrl = "mongodb+srv://christinayan2001:4tF5iYHRfsKxcqeZ@seba22.rvcgfu0.mongodb.net/ServiceHub?retryWrites=true&w=majority&appName=SEBA22";

if (!mongoDbUrl) {
    console.error('MONGO_CONNECTION_STRING is not defined in the .env file');
    process.exit(1);
}

// MongoDB connection
mongoose.connect(mongoDbUrl as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as mongoose.ConnectOptions);
console.log('MongoDB connected');

async function generateTestData(numRecords: number): Promise<void> {
    for (let i = 0; i < numRecords; i++) {
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const hashedPassword = await bcrypt.hash('securepassword', 10);
        const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}@gmail.com`

        // Check if an account with the generated email already exists
        const existingAccount = await Account.findOne({ email: email });
        if (existingAccount) {
            console.log(`Account with email ${email} already exists. Skipping.`);
            continue; // Skip to the next iteration
        }

        const newUser = new Account({
            firstName,
            lastName,
            email: email,
            password: hashedPassword,
            phoneNumber: faker.phone.phoneNumber('+49##########'),
            address: `${faker.address.streetName()} ${faker.random.number({min: 1, max: 100})}, München`,
            description: faker.lorem.sentence(),
            location: 'München',
            postal: '80' + faker.random.number({min: 100, max: 999}).toString(),
            isProvider: true,
        });

        const user = await newUser.save();
        console.log(user);
        // Create two service offerings for each user
        for (let j = 0; j < 2; j++) {
            const serviceOffering = new ServiceOffering({
                serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
                hourlyRate: Math.floor(Math.random() * (60 - 20 + 1)) + 20,
                description: faker.lorem.sentence(),
                isCertified: false,
                isCertificateChecked: false,
                location: 'München',
                provider: user._id,
                baseDuration: 60,
                bufferTimeDuration: 30,
                acceptedPaymentMethods: ["Paypal", "Cash"],
                reviews: [],
                rating: 0, // Initial rating is 0
                reviewCount: 0 // Initial review count is 0
            });

            const savedServiceOffering = await serviceOffering.save();
            console.log(savedServiceOffering);
        }
    }
    console.log(`${numRecords} accounts with service offerings inserted.`);
}

generateTestData(20)
    .then(() => mongoose.disconnect())
    .catch((err) => {
        console.error(err);
        mongoose.disconnect();
    });
