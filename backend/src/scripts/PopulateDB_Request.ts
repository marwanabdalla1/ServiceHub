import mongoose, {Types} from 'mongoose';
import Account from "../models/account";
import ServiceOffering from "../models/serviceOffering";
import ServiceRequest from '../models/serviceRequest';
import Review from '../models/review';
import {JobStatus, RequestStatus} from "../models/enums";
import Job from "../models/job";
import TimeSlot from "../models/timeslot";


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


function getRandomDate(start: Date, end: Date): Date {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    date.setHours(9 + Math.random() * (20 - 9), 0, 0, 0); // Adjust hours to be between 9 AM and 8 PM
    return date;
}

function calculateAppointmentTimes(requestStatus: RequestStatus, serviceOffering: any): {
    appointmentStartTime: Date,
    appointmentEndTime: Date
} {
    const currentDate = new Date();
    const pastDate = new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
    const futureDate = new Date(currentDate.getTime() + 20 * 24 * 60 * 60 * 1000); // 20 days in the future
    const pendingStartDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    let appointmentStartTime: Date;

    switch (requestStatus) {
        case RequestStatus.pending:
            appointmentStartTime = getRandomDate(pendingStartDate, futureDate); // 7 days later
            break;
        case RequestStatus.declined:
        case RequestStatus.cancelled:
            appointmentStartTime = getRandomDate(new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000), futureDate);
            break;
        case RequestStatus.accepted:
            if (Math.random() < 0.5) {
                appointmentStartTime = getRandomDate(pastDate, currentDate);
            } else {
                appointmentStartTime = getRandomDate(currentDate, futureDate);
            }
            break;
        default:
            appointmentStartTime = getRandomDate(pastDate, futureDate);
    }

    const appointmentEndTime = new Date(appointmentStartTime.getTime() + serviceOffering.baseDuration * 60000); // Assuming baseDuration is in minutes

    return {appointmentStartTime, appointmentEndTime};
}

async function findNonOverlappingTimeslot(requestStatus: RequestStatus, serviceOffering: any): Promise<{
    appointmentStartTime: Date;
    appointmentEndTime: Date
} | null> {
    let attempts = 0;
    const maxAttempts = 5; // Maximum number of attempts to find a non-overlapping timeslot

    while (attempts < maxAttempts) {
        const {appointmentStartTime, appointmentEndTime} = calculateAppointmentTimes(requestStatus, serviceOffering);

        // Calculate transit times, extending the start and end times by the buffer period
        const travelTime = serviceOffering.bufferTimeDuration; // Ensure this is in minutes
        const transitStart = new Date(appointmentStartTime.getTime() - travelTime * 60000);
        const transitEnd = new Date(appointmentEndTime.getTime() + travelTime * 60000);

        // Check for overlapping timeslots
        const overlappingTimeslot = await TimeSlot.findOne({
            $or: [
                {transitStart: {$lt: transitEnd, $gte: transitStart}},
                {transitEnd: {$gt: transitStart, $lte: transitEnd}},
                {transitStart: {$lte: transitStart}, transitEnd: {$gte: transitEnd}}
            ]
        });

        if (!overlappingTimeslot) {
            // No overlapping timeslot found, return the calculated times
            return {appointmentStartTime, appointmentEndTime};
        }

        // If there's an overlap, increment the attempt counter and try again
        attempts++;
    }

    // If a non-overlapping timeslot couldn't be found after the maximum number of attempts, return null or handle as needed
    return null;
}


async function generateAndSaveServiceRequest(accounts: any[]): Promise<any> {
    // Randomly select an account as ServiceProvider
    const serviceProviderIndex = Math.floor(Math.random() * accounts.length);
    const serviceProvider = accounts[serviceProviderIndex];
    const serviceOfferings = serviceProvider.serviceOfferings;

    // Randomly select a ServiceOffering from the ServiceProvider
    const serviceOfferingIndex = Math.floor(Math.random() * serviceOfferings.length);
    const serviceOfferingId = serviceOfferings[serviceOfferingIndex];

    // Get the service offering from the database
    const serviceOffering = await ServiceOffering.findById(serviceOfferingId);

    if (!serviceOffering) {
        console.error('Service offering not found.');
        return null;
    }

    // Randomly select another account as RequestedBy
    let requestedByIndex;
    do {
        requestedByIndex = Math.floor(Math.random() * accounts.length);
    } while (serviceProviderIndex === requestedByIndex);
    const requestedBy = accounts[requestedByIndex];

    // Determine Request Status
    const statusChance = Math.random();
    let requestStatus = RequestStatus.pending; // Default to Pending
    if (statusChance < 0.8) requestStatus = RequestStatus.accepted;
    else if (statusChance < 0.85) requestStatus = RequestStatus.declined;
    else if (statusChance < 0.89) requestStatus = RequestStatus.cancelled;

    const timeslot = await findNonOverlappingTimeslot(requestStatus, serviceOffering);
    if (!timeslot) {
        console.error('No non-overlapping timeslot found.');
        return;
    }
    const {appointmentStartTime, appointmentEndTime} = timeslot;
    // Create and save the new ServiceRequest
    const newRequest = new ServiceRequest({
        serviceType: serviceOffering.serviceType,
        appointmentStartTime: appointmentStartTime,
        appointmentEndTime: appointmentEndTime,
        uploads: {}, // Assuming no uploads for test data
        comment: " ", // Assuming no comment for test data
        serviceFee: serviceOffering.get('hourlyRate'),
        serviceOffering: serviceOffering._id,
        provider: serviceProvider._id,
        requestedBy: requestedBy._id,
        requestStatus: requestStatus
    });

    const savedRequest = await newRequest.save();
    console.log(`New service request from ${requestedBy.email} to ${serviceProvider.email} for ${serviceOffering.serviceType} saved.`);
    return {serviceOffering, savedRequest};
}

async function createJobForAcceptedRequest(savedRequest: any) {
    if (savedRequest.requestStatus !== RequestStatus.accepted) {
        console.log('Request status is not accepted. No job will be created.');
        return;
    }

    const currentDate = new Date();
    const twentyDaysAgo = new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000);
    const twoDaysFuture = new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    let jobStatus: JobStatus;
    if (savedRequest.appointmentEndTime >= twentyDaysAgo && savedRequest.appointmentEndTime <= twoDaysFuture) {
        jobStatus = Math.random() < 0.9 ? JobStatus.completed : JobStatus.cancelled; // 90% chance to be completed
    } else {
        const statusChance = Math.random();
        if (statusChance < 0.5) {
            jobStatus = JobStatus.open;
        } else {
            jobStatus = JobStatus.cancelled;
        }
    }

    const newJob = new Job({
        request: savedRequest._id,
        serviceType: savedRequest.serviceType,
        serviceOffering: savedRequest.serviceOffering,
        appointmentStartTime: savedRequest.appointmentStartTime,
        appointmentEndTime: savedRequest.appointmentEndTime,
        serviceFee: savedRequest.serviceFee,
        status: jobStatus,
        provider: savedRequest.provider,
        receiver: savedRequest.requestedBy
    });

    const savedJob = await newJob.save();
    await ServiceRequest.findByIdAndUpdate(savedRequest._id, {job: savedJob._id});
    console.log(`Job for request ${savedRequest._id} created with status ${jobStatus}.`);
    return savedJob;
}

async function createTimeSlotForRequest(serviceRequest: any, serviceOffering: any, job: any = null) {
    const travelTime = serviceOffering.bufferTimeDuration;
    const transitStart = new Date(serviceRequest.appointmentStartTime.getTime() - travelTime * 60000);
    const transitEnd = new Date(serviceRequest.appointmentEndTime.getTime() + travelTime * 60000);

    const timeSlot = new TimeSlot({
        title: serviceOffering.serviceType,
        start: serviceRequest.appointmentStartTime,
        end: serviceRequest.appointmentEndTime,
        transitStart,
        transitEnd,
        isFixed: false,
        isBooked: true,
        requestId: serviceRequest._id,
        jobId: job ? job._id : null,
        createdById: serviceRequest.provider
    });

    await timeSlot.save();
    console.log('TimeSlot created for request:', serviceRequest._id);
}

async function addReviewForCompletedJob(job: any) {
    // Generate a rating based on specified probabilities
    const rating = Math.random();
    let finalRating;
    let toProviderContentOptions;
    let toReceiverContentOptions;

    if (rating < 0.1) {
        finalRating = 1;
        toProviderContentOptions = [
            "This service is really bad.",
            "I am not satisfied with the experience.",
            "Terrible service, very disappointed.",
            "Definitely not what I expected, quite bad.",
            "I had a very bad experience.",
            "The service was not good at all.",
            "Extremely unsatisfied with the service.",
            "It was a bad experience overall.",
            "Not happy with the service provided.",
            "The quality of service was bad."
        ];
        toReceiverContentOptions = [
            "Please ensure clear communication of your needs.",
            "It's important to provide accurate service requests.",
            "Being timely in your responses would improve your experience.",
            "Providing complete details upfront helps me serve you better.",
            "Being respectful is crucial for a good service experience.",
            "Your cooperation is essential for effective service.",
            "Constructive feedback would be helpful.",
            "Understanding the service terms in advance can prevent dissatisfaction.",
            "Discuss any issues during the service for better outcomes.",
            "Adhering to scheduled times and terms is important."
        ];
    } else if (rating < 0.15) {
        finalRating = 2;
        toProviderContentOptions = [
            "The service could be better.",
            "Not the best experience.",
            "There is room for improvement.",
            "Service was lacking in many aspects.",
            "I expected better quality.",
            "Not the best service I've received.",
            "Service could use some improvements.",
            "A few things could be better.",
            "It wasn't great, but not terrible either.",
            "Service was below my expectations."
        ];
        toReceiverContentOptions = [
            "Clear understanding of service guidelines will help.",
            "Timely feedback can greatly improve service outcomes.",
            "Your involvement in the process is important.",
            "Detailed specifications from you can lead to better results.",
            "Mutual respect during interactions is valuable.",
            "Promptness in communication is crucial for success.",
            "Your patience during service adjustments is appreciated.",
            "Accurate feedback helps me improve.",
            "Your flexibility during the service provision is commendable.",
            "Following service instructions improves outcomes for both of us."
        ];
    } else if (rating < 0.25) {
        finalRating = 3;
        toProviderContentOptions = [
            "The service was just ok.",
            "Not the best, but not the worst.",
            "It was decent but could be better.",
            "Service was alright, could be improved.",
            "An average experience.",
            "Service was okay, but not impressive.",
            "It was just fine, nothing special.",
            "Acceptable service, but could improve.",
            "It was decent, but room for improvement.",
            "Service was satisfactory, not exceptional."
        ];
        toReceiverContentOptions = [
            "I appreciate your effort to communicate clearly.",
            "Your active participation helps improve our service together.",
            "Being more responsive to queries enhances your experience.",
            "Thank you for being cooperative.",
            "Being prepared for the service helps everyone.",
            "Your understanding of the service process is appreciated.",
            "Timely decisions help me be more efficient.",
            "I value your feedback to make improvements.",
            "Thank you for respecting the service terms.",
            "Your patience during the process is valued."
        ];
    } else if (rating < 0.5) {
        finalRating = 4;
        toProviderContentOptions = [
            "Good! I'm happy with the service.",
            "Nice job, well done.",
            "The service was good, I'm pleased.",
            "I'm happy with the quality of service.",
            "Nice service, keep it up!",
            "Good service, satisfied customer.",
            "Well done, I'm happy with it.",
            "Service was good, I have no complaints.",
            "I'm pleased with the service received.",
            "Good job, keep up the good work."
        ];
        toReceiverContentOptions = [
            "Your engagement during the service was very helpful.",
            "Thank you for your clear and timely communication.",
            "I appreciate your readiness and organization.",
            "Your positive attitude made the process smoother.",
            "Thank you for being such a considerate client.",
            "Your prompt responses helped a lot.",
            "I appreciate your understanding and flexibility.",
            "Thank you for adhering to the process so well.",
            "Your cooperation made my job easier, thank you.",
            "I'm grateful for your constructive feedback."
        ];
    } else {
        finalRating = 5;
        toProviderContentOptions = [
            "Very nice! Excellent service.",
            "LOVE the service! Fantastic job.",
            "VERY GOOD! I'm extremely happy.",
            "Top service! Would definitely recommend!",
            "Exceptional service, very pleased!",
            "Amazing service, thank you!",
            "Couldn't be happier with the service!",
            "Service was outstanding, highly recommend!",
            "Superb service, very impressed!",
            "I'm thrilled with the service, excellent job!"
        ];
        toReceiverContentOptions = [
            "Excellent communication and cooperation from your side.",
            "Your detailed specifications made my job seamless.",
            "Thank you for being an outstanding client!",
            "Your proactive approach helped achieve the best results.",
            "I'm impressed by your professionalism and courtesy.",
            "Your understanding of the service exceeded my expectations.",
            "Thank you for being so organized and prepared.",
            "Your collaboration made a big difference.",
            "I am grateful for your excellent and timely feedback.",
            "Your respect and consideration were remarkable."
        ];
    }


    // Select content based on the rating
    const toProviderContent = toProviderContentOptions[Math.floor(Math.random() * toProviderContentOptions.length)];
    const toReceiverContent = toReceiverContentOptions[Math.floor(Math.random() * toReceiverContentOptions.length)];
    // Create and save the review (recipient is the provider, reviewer is the receiver)
    const toProviderReview = new Review({
        rating: finalRating,
        content: toProviderContent,
        recipient: job.provider,
        reviewer: job.receiver,
        job: job._id,
        serviceOffering: job.serviceOffering
    });
    const savedToProviderReview = await toProviderReview.save();

    const toReceiverReview = new Review({
        rating: finalRating,
        content: toReceiverContent,
        recipient: job.receiver,
        reviewer: job.provider,
        job: job._id,
        serviceOffering: job.serviceOffering
    });
    const savedToConsumerReview = await toProviderReview.save();
    console.log('Review added for job:', job._id);
    return {savedToProviderReview, savedToReceiverReview: savedToConsumerReview};
}

async function generateTestData(numberOfEntries: number) {
    try {
        // Fetch accounts and their service offerings
        // const accounts = await Account.find({
        //     email: {
        //         $regex: /^[a-zA-Z]+[a-zA-Z]+@gmail\.com$/,
        //         $options: 'i'
        //     }
        // }).populate('serviceOfferings');

        const emails = ["barbarawitting@gmail.com", "terenceschuppe@gmail.com", "dovieo'connell@gmail.com", "krisgreenholt@gmail.com", "tavareslind@gmail.com"];

        const accounts = await Account.find({ email: { $in: emails } });

        if (accounts.length < 2) {
            console.error('Not enough accounts with service offerings found.');
            return;
        }

        for (let i = 0; i < numberOfEntries; i++) {
            const result = await generateAndSaveServiceRequest(accounts);
            if (!result) {
                console.error('Failed to save service request or no result returned.');
                continue;
            }
            const { serviceOffering, savedRequest } = result;
            if (!savedRequest) {
                console.error('Failed to save service request.');
                continue;
            }

            let savedJob;
            if (savedRequest.requestStatus === RequestStatus.accepted) {
                savedJob = await createJobForAcceptedRequest(savedRequest);
                if (!savedJob) {
                    console.error('Failed to save job for accepted request.');
                }
            }

            // Create a TimeSlot for the ServiceRequest and job
            // Check if the request is not cancelled or declined and the job (if exists) is not cancelled
            if (savedRequest.requestStatus !== RequestStatus.cancelled && savedRequest.requestStatus !== RequestStatus.declined) {
                if (!savedJob || (savedJob && savedJob.status !== JobStatus.cancelled)) {
                    await createTimeSlotForRequest(savedRequest, serviceOffering, savedJob);
                }
            }
            // Add a review for the completed job for both the provider and the receiver
            if (savedJob && savedJob.status === JobStatus.completed) {
                const {savedToProviderReview, savedToReceiverReview} = await addReviewForCompletedJob(savedJob);

                // Save the review for the provider
                if (!savedToProviderReview) {
                    console.error('Failed to save review for completed job.');
                } else {
                    serviceOffering.reviews.push(savedToProviderReview._id);
                    serviceOffering.reviewCount++;
                    serviceOffering.totalRating += savedToProviderReview.rating;
                    serviceOffering.rating = serviceOffering.totalRating / serviceOffering.reviewCount;
                    await serviceOffering.save();

                    const account = await Account.findById(serviceOffering.provider);
                    if(account) {
                        if(!account.reviews) {
                            account.reviews = [];
                        }
                        account.reviews.push(savedToProviderReview._id as Types.ObjectId);
                    }
                }

                // Save the review for the receiver
                if (!savedToReceiverReview) {
                    console.error('Failed to save review for completed job.');
                } else {
                    const account = await Account.findById(savedRequest.requestedBy);
                    if(account) {
                        if(!account.reviews) {
                            account.reviews = [];
                        }
                        account.reviews.push(savedToReceiverReview._id as Types.ObjectId);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error generating test data:', error);
    }
}

// Example usage
generateTestData(200).then(() => {
    console.log('Test data generation complete.');
    mongoose.disconnect();
});