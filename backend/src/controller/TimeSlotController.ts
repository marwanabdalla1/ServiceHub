import {RequestHandler} from 'express';
import moment from 'moment';
import Timeslot, {ITimeslot} from '../models/timeslot';
import mongoose, {ClientSession, Types} from "mongoose";

// Custom error class for Timeslot-related errors
class TimeslotError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = "TimeslotError";
    }
}

/**
 * Generates weekly instances of events based on a given date range.
 * @param events - Array of timeslot events to generate instances for.
 * @param existingTimeslots - Array of existing timeslots to check for overlaps.
 * @param startDate - Start date for generating instances.
 * @param endDate - End date for generating instances.
 * @returns {Promise<ITimeslot[]>} - Returns a promise that resolves to an array of weekly instances.
 */
async function generateWeeklyInstances(events: ITimeslot[], existingTimeslots: ITimeslot[], startDate: moment.Moment, endDate: moment.Moment) {
    const weekInstances: ITimeslot[] = [];
    events.forEach(event => {
        const dayOfWeek = moment(event.start).day();
        const currentDate = moment(startDate).day(dayOfWeek); // Get the date for the specific day in the start date week

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

                // Check overlaps and handle them
                let tempInstance = {
                    title: event.title,
                    start: start,
                    end: end,
                    isFixed: true,
                    isBooked: event.isBooked,
                    createdById: event.createdById
                } as ITimeslot;

                // Filter out existing overlaps and adjust the times
                const adjustedInstances = adjustForOverlaps(tempInstance, existingTimeslots);
                weekInstances.push(...adjustedInstances);
            }

            currentDate.add(1, 'week'); // Move to the same day in the next week
        }
    });

    return weekInstances;
}

/**
 * Helper function to adjust new instances based on overlaps.
 * @param newInstance - New timeslot instance to check for overlaps.
 * @param existingTimeslots - Array of existing timeslots to check against.
 * @returns {ITimeslot[]} - Returns an array of adjusted instances.
 */
function adjustForOverlaps(newInstance: ITimeslot, existingTimeslots: ITimeslot[]): ITimeslot[] {
    let adjustedInstances = [newInstance];

    for (let slot of existingTimeslots) {
        const existingStart = slot.transitStart || slot.start;
        const existingEnd = slot.transitEnd || slot.end;

        adjustedInstances = adjustedInstances.reduce((acc: ITimeslot[], current) => {
            if (current.end <= existingStart || current.start >= existingEnd) {
                acc.push(current);
            } else {
                // Adjust the current instance to remove the overlapping part
                if (current.start < existingStart) {
                    acc.push({ ...current, end: existingStart } as ITimeslot);
                }
                if (current.end > existingEnd) {
                    acc.push({ ...current, start: existingEnd } as ITimeslot);
                }
            }
            return acc;
        }, []);
    }

    return adjustedInstances;
}

// Endpoint to extend fixed slots
export const extendFixedSlots: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const { start, end } = req.body;
        const startDate = moment(start).subtract(1, 'week');
        const endDate = moment(end).subtract(1, 'week');

        // Fetch existing fixed events within the one-week range before the start and end dates
        const fixedEvents = await Timeslot.find({
            createdById: userId,
            isFixed: true,
            start: { $gte: new Date(start) },
            end: { $lte: new Date(end) },
        });

        const eventsToExtend = [];

        // Fetch potential future events (i.e. all fixed timeslots of the provider in the future)
        const potentialFutureEvents = await Timeslot.find({
            createdById: userId,
            isFixed: true,
            start: { $gte: endDate.toDate() }
        });

        // Filter future events to check exact time matches
        for (const event of fixedEvents) {
            const eventDayOfWeek = moment(event.start).day();
            const startTime = moment(event.start).format('HH:mm');
            const endTime = moment(event.end).format('HH:mm');

            // check if there is at least one future event of this fixed series
            const futureExists = potentialFutureEvents.some(
                futureEvent => {
                    const isAfter = moment(futureEvent.start).isAfter(event.end);
                    const sameDayOfWeek = moment(futureEvent.start).day() === eventDayOfWeek;
                    const sameStartTime = moment(futureEvent.start).format('HH:mm') === startTime;
                    const sameEndTime = moment(futureEvent.end).format('HH:mm') === endTime;

                    return isAfter && sameDayOfWeek && sameStartTime && sameEndTime;
                });

            // If there is nothing in the future and this event is still supposed to be fixed, extend it
            if (!futureExists) {
                eventsToExtend.push(event);
            }
        }

        // Generate future instances for all events that need extending
        if (eventsToExtend.length > 0) {
            let existingTimeslots: ITimeslot[] = [];
            try {
                existingTimeslots = await getEventsDirect(userId);
            } catch (error) {
                existingTimeslots = []; // Continue with empty array if error
            }

            const futureInstances = await generateWeeklyInstances(eventsToExtend, existingTimeslots, moment(start), moment(end).add(6, 'months'));

            // Insert future instances into the database
            await Timeslot.insertMany(futureInstances.map(instance => ({
                title: instance.title,
                start: instance.start,
                end: instance.end,
                isFixed: true,
                isBooked: instance.isBooked,
                createdById: userId
            })));
        }

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

// Delete Timeslot Endpoint
export const deleteTimeslot: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const { event, deleteAllFuture } = req.body;
        const startTime = new Date(event.start);
        const endTime = new Date(event.end);
        const { title, isFixed } = event;

        // Delete the specific event
        await Timeslot.deleteOne({ start: startTime, end: endTime, createdById: userId });

        // If the event is fixed and deleteAllFuture is set to true, delete its future instances
        if (isFixed && deleteAllFuture) {
            const weekday = (startTime.getDay() + 1) % 7 || 7; // Convert 0 (Sunday in JS) to 7 for MongoDB
            const futureStartDate = moment(startTime).add(1, 'week');
            await Timeslot.deleteMany({
                createdById: userId,
                title,
                isFixed: true,
                start: { $gte: futureStartDate.toDate() },
                $and: [
                    {
                        $or: [ // Start time is within the base event duration
                            { start: { $gte: startTime } },
                            { start: { $lt: endTime } }
                        ]
                    },
                    {
                        $or: [ // End time is within the base event duration
                            { end: { $gt: startTime } },
                            { end: { $lte: endTime } }
                        ]
                    }
                ],
                $expr: {
                    $eq: [{ $dayOfWeek: "$start" }, weekday] // Ensure it's the same day of the week
                }
            });

            // Update all previous ones of this fixed series to make them not fixed
            await Timeslot.updateMany({
                createdById: userId,
                title,
                isFixed: true,
                start: { $lt: startTime },
                $and: [
                    {
                        $or: [ // Start time is within the base event duration
                            { start: { $gte: startTime } },
                            { start: { $lt: endTime } }
                        ]
                    },
                    {
                        $or: [ // End time is within the base event duration
                            { end: { $gt: startTime } },
                            { end: { $lte: endTime } }
                        ]
                    }
                ],
                $expr: {
                    $eq: [{ $dayOfWeek: "$start" }, weekday] // Ensure it's the same day of the week
                }
            }, { $set: { isFixed: false } });
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

// Existing Get Events Controller
export const getEvents: RequestHandler = async (req, res, next) => {
    const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
    const { start, end } = req.query; // Extracting start and end dates from the query parameters

    try {
        const timeslots = await getEventsDirect(userId, start as string, end as string);
        res.json(timeslots);
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};

/**
 * Fetch timeslots directly from the database.
 * @param userId - ID of the user to fetch timeslots for.
 * @param start - Optional start date for filtering timeslots.
 * @param end - Optional end date for filtering timeslots.
 * @returns {Promise<ITimeslot[]>} - Returns a promise that resolves to an array of timeslots.
 */
async function getEventsDirect(userId: any, start?: string, end?: string) {
    try {
        const query: any = { createdById: userId };

        if (start && end) {
            query.$and = [
                { createdById: userId },
                {
                    $or: [
                        {
                            $and: [
                                { start: { $gte: new Date(start) } },
                                { end: { $lte: new Date(end) } }
                            ]
                        },
                        {
                            $and: [
                                { transitStart: { $gte: new Date(start) } },
                                { transitEnd: { $lte: new Date(end) } }
                            ]
                        }
                    ]
                }
            ];
        }

        return Timeslot.find(query);
    } catch (error) {
        throw error; // Rethrow to handle it in the calling function
    }
}

/**
 * Merges overlapping or contiguous timeslots.
 * @param timeslots - Array of timeslots to merge.
 * @returns {ITimeslot[]} - Returns an array of merged timeslots.
 */
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

/**
 * Adjusts timeslots for transit time.
 * @param timeslots - Array of timeslots to adjust.
 * @param transitTime - Transit time in minutes to adjust each timeslot.
 * @returns {ITimeslot[]} - Returns an array of adjusted timeslots.
 */
const adjustForTransit = (timeslots: ITimeslot[], transitTime: number) => {
    return timeslots.map(slot => ({
        ...slot,
        start: new Date(new Date(slot.start).getTime() + transitTime * 60000),
        end: new Date(new Date(slot.end).getTime() - transitTime * 60000)
    }));
};

// Get events by user ID for booking, adjusted for transit time
export const getAvailabilityByProviderId: RequestHandler = async (req, res, next) => {
    const { providerId } = req.params;
    const transitTime = parseInt(req.query.transitTime as string);

    if (isNaN(transitTime)) {
        return res.status(400).json({ error: 'Invalid transit time provided' });
    }

    try {
        // Handle both string and ObjectId
        const providerIdConditions = [
            { createdById: providerId },
            { createdById: new Types.ObjectId(providerId) }
        ];

        // Fetch all future timeslots for the provider
        const timeslots: ITimeslot[] = await Timeslot.find({
            // todo: uncomment
            // end: { $gte: new Date() },
            $or: providerIdConditions,
            isBooked: false,
        }).lean();

        // Merge contiguous and overlapping timeslots
        const mergedTimeslots: ITimeslot[] = mergeTimeslots(timeslots);

        // Adjust for transit time
        const adjustedTimeslots = adjustForTransit(mergedTimeslots, transitTime);

        res.json(adjustedTimeslots);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

// Save events to the database
export const saveEvents: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const { events } = req.body;

        // Generate future instances for new fixed events
        const fixedEvents = events.filter((event: ITimeslot) => event.isFixed);

        let futureInstances: ITimeslot[] = [];
        if (fixedEvents.length > 0) {
            let existingTimeslots: ITimeslot[] = [];
            try {
                existingTimeslots = await getEventsDirect(userId);
            } catch (error) {
                existingTimeslots = []; // Continue with empty array if error
            }
            const futureEndDate = moment(fixedEvents[0].end).endOf('week').add(6, 'months');
            futureInstances = await generateWeeklyInstances(fixedEvents, existingTimeslots, moment(fixedEvents[0].start).add(1, 'week'), futureEndDate);
        }

        // Insert new events into DB
        const allEventsToInsert = [...events, ...futureInstances];
        const insertedEvents = await Timeslot.insertMany(allEventsToInsert.map(event => ({
            title: event.title,
            start: event.start,
            end: event.end,
            isFixed: event.isFixed,
            isBooked: event.isBooked,
            requestId: event.requestId,
            createdById: userId, // Use userId from the token
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

// Get all events by provider
export const getEventsByProvider: RequestHandler = async (req, res, next) => {
    const { providerId } = req.params;
    try {
        const timeslots = await Timeslot.find({ createdById: providerId });
        res.json(timeslots);
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};

// Turn an existing event into a fixed event and create future instances
export const turnExistingEventIntoFixed: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const event = req.body;

        // Find and update the specified event to mark it as fixed
        const eventToUpdate = await Timeslot.findOneAndUpdate({
            _id: event._id,
            createdById: userId,
        }, {
            $set: { isFixed: true }
        }, { new: true });

        if (!eventToUpdate) {
            return res.status(404).json({ message: "Event not found or user mismatch" });
        }

        // Generate future instances based on the newly fixed event
        let futureInstances: ITimeslot[] = [];
        if (eventToUpdate.isFixed) {
            const futureEndDate = moment(eventToUpdate.end).endOf('week').add(6, 'months');
            let existingTimeslots: ITimeslot[] = [];
            try {
                existingTimeslots = await getEventsDirect(userId, eventToUpdate.start.toISOString(), futureEndDate.toISOString());
            } catch (error) {
                existingTimeslots = []; // Continue with empty array if error
            }
            futureInstances = await generateWeeklyInstances([eventToUpdate], existingTimeslots, moment(eventToUpdate.start).add(1, 'week'), futureEndDate);
        }

        // Insert new events
        const insertedEvents = await Timeslot.insertMany(futureInstances.map(instance => ({
            title: instance.title,
            start: instance.start,
            end: instance.end,
            isFixed: instance.isFixed,
            isBooked: instance.isBooked,
            requestId: instance.requestId,
            createdById: userId, // Use userId from the token
        })), { ordered: false });

        res.status(201).json({
            message: "Event marked as fixed and future instances created successfully",
            updatedEvent: eventToUpdate,
            futureEvents: insertedEvents
        });
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

// Check availability of a timeslot
export const checkAvailability: RequestHandler = async (req, res) => {
    const { start, end, createdById } = req.params;

    const startTime = new Date(start);
    const endTime = new Date(end);

    try {
        // Fetch all unbooked timeslots for the provider that might overlap with the requested timeframe
        const timeslots = await Timeslot.find({
            createdById: createdById,
            isBooked: false,
            end: { $gt: start },
            start: { $lt: end },
        });

        // Merge these timeslots to cover the entire requested period
        const merged = mergeTimeslots(timeslots);

        for (const slot of merged) {
            if (slot.start <= startTime && slot.end >= endTime) {
                res.status(200).json({ isAvailable: true });
                return;
            }
        }
        res.status(200).json({ isAvailable: false });
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Book a timeslot directly
/**
 *
 * @param timeslotData - information of the timeslot
 * @param sessionPassed - client session
 */
export const bookTimeslotDirect = async (timeslotData: any, sessionPassed?: ClientSession) => {
    const {
        start,
        end,
        title,
        isFixed,
        isBooked,
        createdById,
        requestId,
        transitStart,
        transitEnd,
        isUpdate
    } = timeslotData;

    let session = sessionPassed;
    let ownSession = false; // Flag to track if the session was created here

    if (!session) {
        session = await mongoose.startSession();
        session.startTransaction();
        ownSession = true; // We started the session, so we'll manage it
    }

    try {
        // Find overlapping timeslots (i.e. find available timeslots that covers this time)
        const overlappingSlots = await Timeslot.find({
            createdById: createdById,
            end: { $gt: transitStart },
            start: { $lt: transitEnd },
            isBooked: false
        }).session(session);

        // if no slots are available during the desired booking time, return an error
        if (overlappingSlots.length <= 0) {
            throw new TimeslotError("Timeslot is no longer available.", 409);
        }


        // Check availability right before the booking
        let available = false;

        // create a copy to not modify the original overlappingSlots
        const copiedSlots = overlappingSlots.map(slot => slot.toObject());

        // merge all the overlapping available timeslots
        const merged = mergeTimeslots(copiedSlots);

        // if the booking time is covered by an available slot, the provider is available
        for (const slot of merged) {
            if (slot.start <= new Date(transitStart) && slot.end >= new Date(transitEnd)) {
                available = true;
                break;
            }
        }

        if (!available) {
            throw new TimeslotError("Timeslot is no longer available.", 409);
        }

        // Create the new timeslot for the booking
        const newTimeslot = new Timeslot({
            start,
            end,
            transitStart,
            transitEnd,
            title,
            isFixed,
            isBooked,
            createdById,
            requestId,
        });

        // Save the new timeslot
        await newTimeslot.save({ session });

        // Adjust exiting available timeslots based on the booked time
        for (const slot of overlappingSlots) {
            // if the booked slot entirely covers an existing availability, delete the existing available slot
            if (moment(new Date(slot.start)).isSameOrAfter(moment(new Date(transitStart))) && moment(new Date(slot.end)).isSameOrBefore(moment(new Date(transitEnd)))) {
                const exactMatchResponse = await Timeslot.findByIdAndDelete(slot._id, { session });

            }
            // if the existing availability covers the entirety of the booking slot, cut the exiting one
            else if (moment(new Date(slot.start)).isBefore(moment(new Date(transitStart))) &&
                moment(new Date(slot.end)).isAfter(moment(new Date(transitEnd)))) {

                const createdSeparated = await Timeslot.create([{
                    start: slot.start,
                    end: transitStart,
                    title: "available",
                    isFixed: false,
                    createdById: slot.createdById,
                    isBooked: false
                }, {
                    start: transitEnd,
                    end: slot.end,
                    title: "available",
                    isFixed: false,
                    createdById: slot.createdById,
                    isBooked: false
                }], { session });
                const deletion = await Timeslot.findByIdAndDelete(slot._id, { session });

            }
            // if the existing availability is partially covered by the booking slot, adjust its start and end
            else {
                if (moment(new Date(slot.end)).isAfter(moment(new Date(transitEnd)))) {
                    slot.start = transitEnd;

                } else if (moment(new Date(slot.start)).isBefore(moment(new Date(transitStart)))) {
                    slot.end = transitStart;
                }
                const finalCheck = await slot.save({ session });
            }
        }

        // potentially end the session
        if (ownSession) {
            await session.commitTransaction();
        }
        return newTimeslot;
    } catch (error: any) {
        if (ownSession) {
            await session.abortTransaction();
        }
        throw error; // Rethrow to handle elsewhere
    } finally {
        if (ownSession) {
            await session.endSession();
        }
    }
};

// Book a timeslot via request
export const bookTimeslot: RequestHandler = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const timeslotData = req.body;
        const result = await bookTimeslotDirect(timeslotData, session);
        await session.commitTransaction();
        res.status(201).json(result);
    } catch (error: any) {
        await session.abortTransaction();
        if (error instanceof TimeslotError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to book timeslot", error: error.message });
        }
    } finally {
        session.endSession();
    }
};

// Cancel a booked timeslot by ID -> just set it back to available
export const cancelTimeslot: RequestHandler = async (req, res) => {
    const { timeslotId } = req.params;

    try {
        const updatedTimeslot = await cancelTimeslotDirect(timeslotId);
        res.status(200).json({ message: "Timeslot cancelled successfully", updatedTimeslot });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to cancel timeslot", error: error.message });
    }
};

// Cancel a timeslot by request ID
export async function cancelTimeslotWithRequestId(requestId: string): Promise<{ success: boolean, message: string }> {
    try {
        const foundTimeslot = await findTimeslotByRequestId(requestId);
        if (!foundTimeslot) {
            return { success: true, message: "No timeslot to cancel, proceeding..." };
        }

        // @ts-ignore
        await cancelTimeslotDirect(foundTimeslot._id);
        return { success: true, message: "Timeslot cancelled successfully" };
    } catch (error) {
        throw new Error("Failed to cancel timeslot");
    }
}


// Update a timeslot with a job ID based on request ID
export async function updateTimeslotWithRequestId(requestId: string, jobId: string): Promise<{ success: boolean, message: string, timeslot?: any }> {
    try {

        const foundTimeslot = await findTimeslotByRequestId(requestId);
        if (!foundTimeslot) {
            return { success: false, message: "No timeslot to update, proceeding..." };
        }

        foundTimeslot.jobId = new Types.ObjectId(jobId);

        const updatedTimeslot = await foundTimeslot.save();
        return { success: true, timeslot: updatedTimeslot, message: "Timeslot updated successfully with the job" };
    } catch (error) {
        throw new Error("Failed to update timeslot");
    }
}

// Cancel a booked timeslot directly by ID
export async function cancelTimeslotDirect(timeslotId: String | Types.ObjectId) {
    try {
        const timeslot = await Timeslot.findById(timeslotId);
        if (!timeslot) {
            throw new Error("Timeslot not found");
        }

        if (timeslot.transitStart) {
            timeslot.start = timeslot.transitStart;
        }
        if (timeslot.transitEnd) {
            timeslot.end = timeslot.transitEnd;
        }

        timeslot.title = "available";
        timeslot.transitStart = undefined;
        timeslot.transitEnd = undefined;
        timeslot.isBooked = false;
        timeslot.requestId = undefined;
        timeslot.jobId = undefined;

        return await timeslot.save();
    } catch (error) {
        throw error;
    }
}


// Find a timeslot by request ID
export async function findTimeslotByRequestId(requestId: String | Types.ObjectId): Promise<ITimeslot | null> {
    try {
        const timeslot = await Timeslot.findOne({ requestId: requestId });
        if (!timeslot) {
            return null;
        }
        return timeslot;
    } catch (error) {
        return null;
    }
}

// Helper function to calculate duration in minutes
const getDurationInMinutes = (start: Date, end: Date): number => {
    return (new Date(end).getTime() - new Date(start).getTime()) / 60000;
};

// Get the next available timeslot to display at the provider's profile
export const getNextAvailability: RequestHandler = async (req, res, next) => {
    const { providerId } = req.params;
    const transitTime = parseInt(req.query.transitTime as string) || 30;
    const defaultDuration = parseInt(req.query.defaultDuration as string) || 30;

    try {
        const providerIdConditions = [
            { createdById: providerId },
            { createdById: new Types.ObjectId(providerId) }
        ];

        // the timeslot has to be in the future
        const timeslots: ITimeslot[] = await Timeslot.find({
            $or: providerIdConditions,
            isBooked: false,
            start: { $gte: new Date() }
        }).sort({ start: 1 }).lean();

        const merged = mergeTimeslots(timeslots);
        const adjustedTimeslots = adjustForTransit(merged, transitTime);

        const validTimeslots = adjustedTimeslots.filter(slot => {
            const duration = getDurationInMinutes(new Date(slot.start), new Date(slot.end));
            return duration >= defaultDuration;
        });

        if (validTimeslots.length > 0) {
            return res.json({ nextAvailability: validTimeslots[0] });
        } else {
            return res.status(404).json({ message: 'No available timeslots found' });
        }
    } catch (error: any) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
