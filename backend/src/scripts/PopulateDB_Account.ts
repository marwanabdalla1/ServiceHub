import mongoose, {Types} from 'mongoose';
import * as faker from 'faker';
import bcrypt from 'bcrypt';
import Account from "../models/account";
import ServiceOffering from "../models/serviceOffering";
import {ServiceType} from "../models/enums";
import PlatformFeedback, {ReviewCategory} from "../models/platformFeedback";

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

async function createServiceOfferingsForUser(user: any, serviceTypes: string[]): Promise<void> {
    for (let j = 0; j < 1; j++) {
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
            reviewCount: 0, // Initial review count is 0
            totalRating: 0
        });
        const existingService = await ServiceOffering.findOne({
            serviceType: serviceOffering.serviceType,
            provider: serviceOffering.provider
        });
        if (existingService) {
            j--;
            continue;
        }
        const savedServiceOffering = await serviceOffering.save();

        if (!user.isProvider) {
            user.isProvider = true;
        }
        // Add the new service offering to the account's serviceOfferings array
        user.serviceOfferings.push(savedServiceOffering._id as Types.ObjectId);
        await user.save();
    }
}

async function generateAndSavePremiumUpgradeReview(user: any): Promise<void> {
    if (!user.isPremium) {
        return;
    }
    const rating = Math.random();
    let finalRating;
    let content;
    if (rating < 0.1) {
        finalRating = 1;
        content = [
            {
                title: "Disappointing Premium Upgrade",
                content: "The premium features are lacking and not worth the upgrade."
            },
            {title: "Waste of Money", content: "Regret upgrading to premium, saw no significant benefits."},
            {
                title: "Premium? Really?",
                content: "Called this a premium service? It's just a title with no perks."
            },
            {
                title: "Unsatisfactory Premium Features",
                content: "None of the promised premium features work as expected."
            },
            {
                title: "Not Recommended",
                content: "Upgrading to premium was a big mistake, totally not recommended."
            },
            {
                title: "Horrible Experience",
                content: "Had a horrible experience with the premium upgrade. It added no value."
            },
            {title: "Frustrating and Useless", content: "Premium upgrade was frustrating and utterly useless."},
            {title: "Bad Decision", content: "The decision to go premium was one I regret deeply."},
            {title: "Unhelpful Premium Support", content: "Even the premium support was unhelpful and slow."},
            {
                title: "Failed Expectations",
                content: "The premium service failed all my expectations, not worth the cost."
            }
        ];
    } else if (rating < 0.15) {
        finalRating = 2;
        content = [
            {
                title: "Slightly Better Than Basic",
                content: "Only marginally better than the basic service, not worth the upgrade."
            },
            {
                title: "Minimal Benefits",
                content: "The benefits of going premium are minimal and not as advertised."
            },
            {
                title: "Disappointing Support",
                content: "Expected better support for premium users, was left disappointed."
            },
            {title: "Underwhelming Premium", content: "Underwhelming premium features, expected much more."},
            {title: "Not Up to Par", content: "Premium features not up to the standard promised."},
            {
                title: "Moderate Improvement",
                content: "Slight improvement over basic, but not what was expected."
            },
            {title: "Premium, Barely", content: "Barely feels like a premium service, very underwhelming."},
            {title: "Expected More", content: "Expected more from a premium upgrade, left wanting."},
            {title: "Overpromised", content: "Service overpromised on premium features, underdelivered."},
            {title: "Lacking Value", content: "Not much value added with the premium upgrade."}
        ];
    } else if (rating < 0.25) {
        finalRating = 3;
        content = [
            {
                title: "Average Premium Experience",
                content: "Premium service is just average; not bad but nothing special."
            },
            {
                title: "Decent But Could Improve",
                content: "Decent benefits from premium, but could definitely improve."
            },
            {title: "Fairly Good", content: "Fairly good premium features, but not fully worth the cost."},
            {title: "Good, Not Great", content: "Good features, but not great. Premium could be much better."},
            {title: "Okay Upgrade", content: "The upgrade to premium was okay, not the best investment."},
            {title: "Satisfactory", content: "Satisfactory premium features, but I expected more."},
            {
                title: "Middle of the Road",
                content: "A middle-of-the-road premium experience, nothing too exciting."
            },
            {title: "Adequate Features", content: "Premium features are adequate but not compelling."},
            {title: "Needs More", content: "Premium service needs more unique features to be truly valuable."},
            {
                title: "Not Fully Satisfied",
                content: "Not fully satisfied with the premium upgrade, expected more uniqueness."
            }
        ];
    } else if (rating < 0.5) {
        finalRating = 4;
        content = [
            {title: "Good Premium Service", content: "Good premium service, with some really useful features."},
            {title: "Worth the Upgrade", content: "Mostly worth the upgrade, with some noticeable benefits."},
            {
                title: "Nice Additional Features",
                content: "Nice additional features in premium, made a positive difference."
            },
            {
                title: "Happy with Premium",
                content: "Happy with the premium upgrade, it enhanced my experience."
            },
            {title: "Very Good Service", content: "Very good premium service, almost everything I hoped for."},
            {title: "Solid Upgrade", content: "Solid upgrade to premium, offers good value."},
            {title: "Pleased with Extras", content: "Pleased with the extra features available in premium."},
            {
                title: "Almost Perfect",
                content: "The premium upgrade is almost perfect, just a few tweaks needed."
            },
            {title: "Great Support", content: "Great support for premium users, very responsive and helpful."},
            {title: "Highly Useful", content: "Premium features are highly useful and well-implemented."}
        ];
    } else {
        finalRating = 5;
        content = [
            {
                title: "Excellent Premium Upgrade",
                content: "Excellent premium upgrade, completely satisfied with all the features!"
            },
            {title: "Best Decision", content: "Upgrading to premium was the best decision, highly recommend!"},
            {
                title: "Fantastic Premium Features",
                content: "Fantastic premium features, they significantly enhance the service."
            },
            {title: "Totally Worth It", content: "Totally worth the upgrade, premium service is top-notch."},
            {
                title: "Exceptional Value",
                content: "Exceptional value from the premium service, exceeded all my expectations."
            },
            {
                title: "Perfect Upgrade",
                content: "The upgrade to premium was perfect, everything I needed and more."
            },
            {
                title: "Highly Recommend Premium",
                content: "I highly recommend the premium upgrade, it's absolutely worth it."
            },
            {
                title: "Outstanding Premium Service",
                content: "Outstanding premium service, very pleased with the features and support."
            },
            {
                title: "Superior Experience",
                content: "Superior experience with premium, it makes a big difference."
            },
            {
                title: "Thrilled with Premium",
                content: "Thrilled with the premium upgrade, it has been a game-changer!"
            }
        ];
    }

    const contentIndex = Math.floor(Math.random() * content.length);

    const platformFeedback = {
        title: content[contentIndex].title,
        rating: finalRating,
        content: content[contentIndex].content,
        category: ReviewCategory.Premium,
        givenBy: user._id
    };

    // save the platform feedback
    const feedback = new PlatformFeedback(platformFeedback);
    await feedback.save();
}

async function generateTestData(numRecords: number): Promise<void> {
    for (let i = 0; i < numRecords; i++) {
        const firstName = faker.name.firstName().replace(/[^a-zA-Z]/g, '');
        const lastName = faker.name.lastName().replace(/[^a-zA-Z]/g, '');
        const hashedPassword = await bcrypt.hash('securepassword', 10);
        const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}@gmail.com`


        // Check if an account with the generated email already exists
        const existingAccount = await Account.findOne({email: email});
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
            isPremium: Math.random() <= 0.2,
        });

        const user = await newUser.save();

        // Create two service offerings for each user
        await createServiceOfferingsForUser(user, serviceTypes);

        // Create a review for the experience of upgrading premium for premium users
        await generateAndSavePremiumUpgradeReview(user);

        console.log(user);
    }

    console.log(`${numRecords} accounts with service offerings inserted.`);
}

generateTestData(50)
    .then(() => mongoose.disconnect())
    .catch((err) => {
        console.error(err);
        mongoose.disconnect();
    });
