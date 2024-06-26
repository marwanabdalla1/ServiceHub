import { RequestHandler } from 'express';
import moment from 'moment';
import Timeslot, { ITimeslot } from '../models/timeslot';
import mongoose from "mongoose";

// Function to generate weekly instances (existing code)
function generateWeeklyInstances(events: ITimeslot[], startDate: moment.Moment, endDate: moment.Moment) {
    const weekInstances: ITimeslot[] = [];
    events.forEach(event => {
        const dayOfWeek = moment(event.start).day();
        let currentDate = moment(startDate).day(dayOfWeek); // Get the date for the specific day in the start date week

        while (currentDate.isBefore(endDate)) {
            if (currentDate.isBetween(startDate, endDate, 'day', '[]')) {
                const start = moment(currentDate).set({
                    hour: moment(event.start).hours(),
                    minute: moment(event.start).minutes(),
                    second: moment(event.start).seconds()
                }).toDate();

                const end = moment(currentDate).set({
                    hour: moment(event.end).hours(),
                    minute: moment(event.end).minutes(),
                    second: moment(event.end).seconds()
                }).toDate();

                const exists = weekInstances.some(instance => 
                    instance.start.getTime() === start.getTime() && 
                    instance.end.getTime() === end.getTime() && 
                    instance.createdById === event.createdById
                );

                if (!exists) {
                    weekInstances.push({ 
                        title: event.title, 
                        start, 
                        end, 
                        isFixed: event.isFixed, 
                        isBooked: event.isBooked, 
                        createdById: event.createdById 
                    } as ITimeslot);
                }
            }

            currentDate.add(1, 'week'); // Move to the same day in the next week
        }
    });

    return weekInstances;
}

// New Endpoint to Extend Fixed Slots (updated code)
export const extendFixedSlots: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;// Assuming userId is available in the request (e.g., from authentication middleware)
        const { start, end } = req.body;
        const startDate = moment(start).subtract(1, 'week');
        const endDate = moment(end).subtract(1, 'week');

        // Fetch existing fixed events within the one-week range before the start and end dates
        const fixedEvents = await Timeslot.find({ 
            createdById: userId, 
            isFixed: true,
            start: { $gte: startDate.toDate() },
            end: { $lte: endDate.toDate() }
        });

        // Generate new instances
        const futureInstances = generateWeeklyInstances(fixedEvents, moment(start), moment(end));

        // Insert future instances into the database
        await Timeslot.insertMany(futureInstances.map(instance => ({
            title: instance.title,
            start: instance.start,
            end: instance.end,
            isFixed: instance.isFixed,
            isBooked: instance.isBooked,
            createdById: userId
        })));

        res.status(201).json({ message: "Extended fixed slots successfully" });
    } catch (err) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
};

// Delete Timeslot Endpoint (updated code)
export const deleteTimeslot: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;// Assuming userId is available in the request (e.g., from authentication middleware)
        const { event } = req.body;
        const start = new Date(event.start);
        const end = new Date(event.end);
        const { title, isFixed } = event;

        // Delete the specific event
        await Timeslot.deleteOne({ start, end, createdById: userId });

        // If the event is fixed, delete its future instances
        if (isFixed) {
            const futureStartDate = moment(start).add(1, 'week');
            await Timeslot.deleteMany({
                createdById: userId,
                title,
                start: { $gte: futureStartDate.toDate() }
            });
        }

        res.status(200).json({ message: 'Timeslot deleted successfully' });
    } catch (err) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
};

// Existing Get Events Controller (updated code)
export const getEvents: RequestHandler = async (req, res, next) => {
    const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
    try {
        const timeslots = await Timeslot.find({ createdById: userId });
        res.json(timeslots);
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};



// merge overlapping timeslots
const mergeAndCleanTimeslots = async (providerId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const timeslots: ITimeslot[] = await Timeslot.find({
            createdById: providerId,
            isBooked: false
        }).session(session);

        if (!timeslots.length) {
            await session.commitTransaction();
            session.endSession();
            return;
        }

        // Sort timeslots by start time
        timeslots.sort((a, b) => a.start.getTime() - b.start.getTime());

        const merged = [];
        let last = timeslots[0];

        // loop through the timeslots to find overlapping ones
        for (let i = 1; i < timeslots.length; i++) {
            if (timeslots[i].start <= last.end) {
                last.end = new Date(Math.max(last.end.getTime(), timeslots[i].end.getTime()));
                // Mark the current timeslot for deletion since it's merged
                await Timeslot.findByIdAndDelete(timeslots[i]._id, { session });
            } else {
                merged.push(last);
                last = timeslots[i];
            }
        }
        merged.push(last); // Push the last processed timeslot

        // Ensure the last timeslot has the updated end time in the database
        await Timeslot.findByIdAndUpdate(last._id, { end: last.end }, { session });

        await session.commitTransaction();
        session.endSession();
        return merged; // Optional: return the merged timeslots for verification/testing
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};




// helper functions to help getting the avilability of provider
const mergeTimeslots = (timeslots: ITimeslot[]) => {
    if (!timeslots.length) return [];

    // Sort timeslots by start time
    timeslots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const merged = [timeslots[0]];
    for (let i = 1; i < timeslots.length; i++) {
        let last = merged[merged.length - 1];
        if (new Date(timeslots[i].start).getTime() <= new Date(last.end).getTime()) {
            // There is overlap, or they are contiguous
            last.end = new Date(Math.max(new Date(last.end).getTime(), new Date(timeslots[i].end).getTime()));
        } else {
            merged.push(timeslots[i]);
        }
    }

    return merged;

};

const adjustForTransit = (timeslots: ITimeslot[], transitTime: number) => {

    return timeslots.map(slot => ({
        ...slot,
        start: new Date(new Date(slot.start).getTime() + transitTime * 60000),
        end: new Date(new Date(slot.end).getTime() - transitTime * 60000)
    }));
};


// get events by user ID (i.e. of a provider)
export const getAvailabilityByProviderId: RequestHandler = async (req, res, next) => {
    // const userId = (req as any).user.userId; // consumer id
    const {providerId} = req.params;
    const transitTime = parseInt(req.query.transitTime as string); // Get the transit time from query params
    console.log(req.query, "transit Time: ", transitTime)
    if (isNaN(transitTime)) {
        console.log("invalid transit time!")
        return res.status(400).json({ error: 'Invalid transit time provided' });
    }

    try {
        // Fetch all timeslots for the provider
        const timeslots: ITimeslot[] = await Timeslot.find({ createdById: providerId, isBooked:false, }).lean();

        // Merge contiguous and overlapping timeslots
        // todo: replace/delete this once the mergeandclean is done
        const mergedTimeslots: ITimeslot[] = mergeTimeslots(timeslots);

        // Adjust for transit time
        const adjustedTimeslots = adjustForTransit(mergedTimeslots, transitTime);

        // console.log("adjusted timeslots:", adjustedTimeslots);
        res.json(adjustedTimeslots);
    } catch (error: any) {
        console.error("Error fetching timeslots:", error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

// Updated Save Events Controller
export const saveEvents: RequestHandler = async (req, res, next) => {
    try {
        console.log(req)
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const { events } = req.body;
        console.log('User ID:', userId);
        // Generate future instances for new fixed events
        const fixedEvents = events.filter((event: ITimeslot) => event.isFixed);
        let futureInstances: ITimeslot[] = [];
        if (fixedEvents.length > 0) {
            const futureEndDate = moment(fixedEvents[0].end).endOf('week').add(6, 'months');
            futureInstances = generateWeeklyInstances(fixedEvents, moment(fixedEvents[0].start).add(1, 'week'), futureEndDate);
        }

        // Insert new events
        const allEventsToInsert = [...events, ...futureInstances];
        console.log('All events to insert:', allEventsToInsert);
        const insertedEvents = await Timeslot.insertMany(allEventsToInsert.map(event => ({
            title: event.title,
            start: event.start,
            end: event.end,
            isFixed: event.isFixed,
            isBooked: event.isBooked,
            createdById: userId // Use userId from the token
        })), { ordered: false });

        res.status(201).json({ insertedEvents });
    } catch (err) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
};

// export const bookTimeslot: RequestHandler = async (req, res, next) => {
//     const userId = (req as any).user.userId; // consumer id
//
//     const { start, end, title, isFixed, isBooked, createdById } = req.body;
//
//     try {
//         const newTimeslot = await Timeslot.create({
//             start,
//             end,
//             title,
//             isFixed,
//             isBooked,
//             createdById,  // This should be the userId of the user making the booking
//         });
//
//         res.status(201).json(newTimeslot);
//
//     //     then:
//     } catch (error: any) {
//         console.error("Error saving new timeslot:", error);
//         res.status(500).json({ message: "Failed to book timeslot", error: error.message });
//     }
// };

export const bookTimeslot: RequestHandler = async (req, res) => {
    // const userId = (req as any).user.userId; // consumer id
    console.log(req.body)
    const { start, end, title, isFixed, isBooked, createdById } = req.body;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Create the new timeslot for the booking
        const newTimeslot = new Timeslot({
            start,
            end,
            title,
            isFixed,
            isBooked,
            createdById,
            // requestId,
        });

        // Find overlapping timeslots
        const overlappingSlots = await Timeslot.find({
            createdById: createdById,
            end: { $gt: start },
            start: { $lt: end },
            isBooked: false // assuming only unbooked slots are modifiable
        }).session(session);

        console.log("overlaps: ", overlappingSlots);
        // Adjust timeslots based on the booked time
        for (const slot of overlappingSlots) {
            if (new Date(slot.start) < new Date(start) && new Date(slot.end) > new Date(end)) {
                // Split the timeslot into two parts before and after the booked slot
                await Timeslot.create([{
                    start: slot.start,
                    end: start,
                    title: "available",
                    isFixed: false, //todo: not sure if this should be true if the original timeslot is fixed
                    createdById: slot.createdById,
                    isBooked: false
                }, {
                    start: end,
                    end: slot.end,
                    title: "available",
                    isFixed: false,
                    createdById: slot.createdById,
                    isBooked: false
                }], { session });
                // Remove the original slot
                await Timeslot.findByIdAndDelete(slot._id, { session });
            } else {
                // Adjust existing slot start or end
                if (new Date(slot.end) > new Date(end)) {
                    slot.start = end;
                } else if (new Date(slot.start) < new Date(start)) {
                    slot.end = start;
                }
                await slot.save({ session });
            }
        }

        await newTimeslot.save({ session });
        await session.commitTransaction();
        res.status(201).json(newTimeslot);
    } catch (error: any) {
        await session.abortTransaction();
        console.error("Failed to book timeslot:", error);
        res.status(500).json({ message: "Failed to book timeslot", error: error.message });
    } finally {
        session.endSession();
    }
};

