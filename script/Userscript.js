const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const users = [
    {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile1.png",
        description: "Enthusiastic and experienced bike repair technician.",
        location: "Berlin",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "bikeRepair0",
                serviceType: "Bike Repair",
                description: "Professional bike repair services.",
                location: "Berlin",
                hourlyRate: 50,
                isCertified: false,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.5
            }
        ],
    },
    {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile2.png",
        description: "Dedicated to providing top-notch house cleaning services.",
        location: "Munich",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "babySitting0",
                serviceType: "Baby Sitting",
                description: "Reliable and caring babysitting services.",
                location: "Munich",
                hourlyRate: 50,
                isCertified: false,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.5
            }
        ],
    },
    {
        firstName: "Robert",
        lastName: "Brown",
        email: "robert.brown@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile3.png",
        description: "Passionate about keeping homes spotless.",
        location: "Hamburg",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "babySitting1",
                serviceType: "Baby Sitting",
                description: "Expert babysitting services.",
                location: "Hamburg",
                hourlyRate: 50,
                isCertified: false,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.5
            }
        ],
    },
    {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile4.png",
        description: "Experienced tutor with a passion for teaching.",
        location: "Cologne",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "tutoring0",
                serviceType: "Tutoring",
                description: "Personalized tutoring services.",
                location: "Cologne",
                hourlyRate: 30,
                isCertified: true,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.9
            }
        ],
    },
    {
        firstName: "Michael",
        lastName: "Wilson",
        email: "michael.wilson@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile5.png",
        description: "Animal lover and professional pet sitter.",
        location: "Frankfurt",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "petSitting0",
                serviceType: "Pet Sitting",
                description: "Trustworthy pet sitting services.",
                location: "Frankfurt",
                hourlyRate: 18,
                isCertified: false,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.6
            }
        ],
    },
    {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile6.png",
        description: "Creative and skilled landscaper.",
        location: "Stuttgart",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "landscaping0",
                serviceType: "Landscaping Service",
                description: "Expert landscaping services.",
                location: "Stuttgart",
                hourlyRate: 22,
                isCertified: true,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.7
            }
        ],
    },
    {
        firstName: "David",
        lastName: "Williams",
        email: "david.williams@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile7.png",
        description: "Experienced home remodeling professional.",
        location: "Düsseldorf",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "homeRemodeling0",
                serviceType: "Home Remodeling",
                description: "Comprehensive home remodeling services.",
                location: "Düsseldorf",
                hourlyRate: 35,
                isCertified: true,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.4
            }
        ],
    },
    {
        firstName: "Ashley",
        lastName: "Jones",
        email: "ashley.jones@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile8.png",
        description: "Professional mover with years of experience.",
        location: "Dortmund",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "movingServices0",
                serviceType: "Moving Service",
                description: "Reliable and efficient moving services.",
                location: "Dortmund",
                hourlyRate: 28,
                isCertified: true,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.8
            }
        ],
    },
    {
        firstName: "Bob",
        lastName: "Biker",
        email: "bob.biker@mail.com",
        phoneNumber: "1234567890",
        address: "123 Main St",
        createdOn: new Date(),
        profileImageUrl: "/images/profiles/profile9.png",
        description: "Avid cyclist and expert bike repair technician.",
        location: "Essen",
        isProvider: false,
        isPremium: true,
        serviceOfferings: [
            {
                serviceOfferingId: "bikeRepair1",
                serviceType: "Bike Repair",
                description: "Top-notch bike repair services.",
                location: "Essen",
                hourlyRate: 50,
                isCertified: false,
                createdOn: new Date(),
                lastUpdatedOn: new Date(),
                certificate: {
                    name: "empty.txt",
                    data: Buffer.from(""),
                    contentType: "text/plain"
                },
                baseDuration: 2,
                bufferTimeDuration: 0.5,
                rating: 4.5
            }
        ],
    }
];

const uri = 'mongodb+srv://christinayan2001:4tF5iYHRfsKxcqeZ@seba22.rvcgfu0.mongodb.net/ServiceHub?retryWrites=true&w=majority&appName=SEBA22'; // Your MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ServiceHub'); 

        // Clear existing data
        await accountsCollection.deleteMany({});
        await serviceOfferingsCollection.deleteMany({});

        for (const user of users) {
            const { serviceOfferings, ...userWithoutServiceOfferings } = user;

            // Insert the account data
            const accountResult = await accountsCollection.insertOne(userWithoutServiceOfferings);
            const accountId = accountResult.insertedId;

            // Insert service offerings and link them to the account
            for (const service of serviceOfferings) {
                const serviceWithAccountId = { 
                    ...service, 
                    provider: accountId 
                };
                const serviceOfferingResult = await serviceOfferingsCollection.insertOne(serviceWithAccountId);

                // Add the service offering ID to the account's serviceOfferings array
                await accountsCollection.updateOne(
                    { _id: accountId },
                    { $push: { serviceOfferings: serviceOfferingResult.insertedId } }
                );
            }
        }

        console.log('Data successfully inserted into MongoDB');
    } catch (err) {
        console.error('Error inserting data: ', err);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
