import {RequestHandler} from 'express';
import moment from 'moment';
import Timeslot, {ITimeslot} from '../models/timeslot';
import mongoose, {Types} from "mongoose";
import ServiceRequest from "../models/serviceRequest";
import {ObjectId} from "mongodb";
import {createNotificationDirect} from "./NotificationController";

async function generateWeeklyInstances(events: ITimeslot[], existingTimeslots: ITimeslot[], startDate: moment.Moment, endDate: moment.Moment) {
    // console.log("existing ones:", existingTimeslots)
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
                //
                // const exists = weekInstances.some(instance =>
                //         instance.start.getTime() === start.getTime() &&
                //         instance.end.getTime() === end.getTime() &&
                //         instance.createdById === event.createdById
                //     // instance.baseEventId === event.baseEventId
                // );
                //
                //
                // if (!exists) {
                //     weekInstances.push({
                //         title: event.title,
                //         start,
                //         end,
                //         isFixed: event.isFixed,
                //         isBooked: event.isBooked,
                //         createdById: event.createdById,
                //         // baseEventId: event.baseEventId
                //     } as ITimeslot);
                // }

                // check overlaps and handle them
                let tempInstance = {
                    title: event.title,
                    start: start,
                    end: end,
                    isFixed: event.isFixed,
                    isBooked: event.isBooked,
                    createdById: event.createdById
                } as ITimeslot;

                console.log("tempInstance", tempInstance)

                // Filter out existing overlaps and adjust the times
                const adjustedInstances = adjustForOverlaps(tempInstance, existingTimeslots);
                weekInstances.push(...adjustedInstances);
            }

            currentDate.add(1, 'week'); // Move to the same day in the next week
        }
    });

    return weekInstances;
}

// Helper function to adjust new instances based on overlaps
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
                    acc.push({
                        ...current, end: existingStart
                    } as ITimeslot);
                }
                if (current.end > existingEnd) {
                    acc.push({...current, start: existingEnd} as ITimeslot);
                }
            }
            return acc;
        }, []);
    }

    return adjustedInstances;
}

// async function generateWeeklyInstances(events: ITimeslot[], userId: any, startDate: moment.Moment, endDate: moment.Moment): Promise<ITimeslot[]> {
//     let existingTimeslots: any[] = [];
//     try {
//         // Asynchronously get existing timeslots
//         existingTimeslots = await getEventsDirect(userId);
//     } catch (error) {
//         console.error("Error fetching existing timeslots:", error);
//         existingTimeslots = []; // Continue with empty array if error
//     }
//
//     const weekInstances: ITimeslot[] = [];
//     events.forEach(event => {
//         const dayOfWeek = moment(event.start).day();
//         let currentDate = moment(startDate).day(dayOfWeek);
//
//         while (currentDate.isBefore(endDate)) {
//             if (currentDate.isBetween(startDate, endDate, 'day', '[]')) {
//                 // Use regular times for weekly event
//                 const start = moment(currentDate).set({
//                     hour: moment(event.start).hours(),
//                     minute: moment(event.start).minutes(),
//                     second: moment(event.start).seconds()
//                 }).toDate();
//
//                 const end = moment(currentDate).set({
//                     hour: moment(event.end).hours(),
//                     minute: moment(event.end).minutes(),
//                     second: moment(event.end).seconds()
//                 }).toDate();
//
//                 let tempInstances = [{
//                     ...event,
//                     start,
//                     end
//                 }];
//
//                 // Check for overlaps and adjust timeslots using transit times if available
//                 existingTimeslots.forEach(e => {
//                     // Use transit times if available to determine overlap
//                     const existingStart = e.transitStart || e.start;
//                     const existingEnd = e.transitEnd || e.end;
//
//                     tempInstances = tempInstances.reduce<ITimeslot[]>((acc, current) => {
//                         if (current.end <= existingStart || current.start >= existingEnd) {
//                             // No overlap
//                             acc.push(current);
//                         } else {
//                             // Split the timeslot around the existing timeslot
//                             if (current.start < existingStart) {
//                                 acc.push({
//                                     ...current,
//                                     end: existingStart
//                                 });
//                             }
//                             if (current.end > existingEnd) {
//                                 acc.push({
//                                     ...current,
//                                     start: existingEnd
//                                 });
//                             }
//                         }
//                         return acc;
//                     }, []);
//                 });
//
//                 weekInstances.push(...tempInstances);
//             }
//
//             currentDate.add(1, 'week'); // Move to the next week
//         }
//     });
//
//     return weekInstances;
// }

// * Adjusts available timeslots based on overlaps with booked timeslots.
// const adjustAvailableSlots = (availableSlots: ITimeslot[], bookedSlots: ITimeslot[]) => {
//     let adjustedSlots = [];
//
//     // Sort both arrays by start time for proper comparison
//     availableSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
//     bookedSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
//
//     let ai = 0, bi = 0;
//
//     while (ai < availableSlots.length) {
//         let availSlot = availableSlots[ai];
//         let isAdjusted = false;
//
//         while (bi < bookedSlots.length && bookedSlots[bi].end <= availSlot.start) {
//             bi++; // Move past booked slots that end before the available slot starts
//         }
//
//         while (bi < bookedSlots.length && bookedSlots[bi].start < availSlot.end) {
//             const bookedSlot = bookedSlots[bi];
//
//             if (bookedSlot.start <= availSlot.start && bookedSlot.end >= availSlot.end) {
//                 // Booked slot completely covers available slot, no part of this slot is available
//                 isAdjusted = true;
//                 break;
//             } else if (bookedSlot.start > availSlot.start && bookedSlot.end < availSlot.end) {
//                 // Booked slot splits available slot into two
//                 adjustedSlots.push({
//                     ...availSlot,
//                     end: new Date(bookedSlot.start)
//                 });
//                 availSlot = {
//                     ...availSlot,
//                     start: new Date(bookedSlot.end)
//                 };
//                 isAdjusted = true;
//             } else if (bookedSlot.start <= availSlot.start && bookedSlot.end < availSlot.end) {
//                 // Booked slot cuts off the start of the available slot
//                 availSlot.start = new Date(bookedSlot.end);
//                 isAdjusted = true;
//             } else if (bookedSlot.start > availSlot.start && bookedSlot.end >= availSlot.end) {
//                 // Booked slot cuts off the end of the available slot
//                 availSlot.end = new Date(bookedSlot.start);
//                 isAdjusted = true;
//             }
//             bi++;
//         }
//
//         if (!isAdjusted) {
//             adjustedSlots.push(availSlot);
//         }
//         ai++;
//     }
//
//     return adjustedSlots;
// };

// New Endpoint to Extend Fixed Slots (updated code)
export const extendFixedSlots: RequestHandler = async (req, res, next) => {
    console.log("trying to extend fixed timeslots!")
    try {

        const userId = (req as any).user.userId;// Assuming userId is available in the request (e.g., from authentication middleware)
        const {start, end} = req.body;
        const startDate = moment(start).subtract(1, 'week');
        const endDate = moment(end).subtract(1, 'week');


        // Fetch existing fixed events within the one-week range before the start and end dates
        const fixedEvents = await Timeslot.find({
            createdById: userId,
            isFixed: true,
            start: {$gte: new Date(start)},
            end: {$lte: new Date(end)},
        });

        // check if this is actually the last event
        const eventsToExtend = [];

        // Fetch potential future events, including non-active ones!
        const potentialFutureEvents = await Timeslot.find({
            createdById: userId,
            isFixed: true,
            start: { $gte: endDate.toDate() }
        });

        console.log("potential future events:", potentialFutureEvents.length)

        // Filter future events to check exact timing match
        for (const event of fixedEvents) {
            const eventDayOfWeek = moment(event.start).day();
            console.log("EventDayOfWeek", eventDayOfWeek)
            const startTime = moment(event.start).format('HH:mm');
            console.log("futre startTime", startTime)

            const endTime = moment(event.end).format('HH:mm');
            console.log("futre endTime", endTime)


            const futureExists = potentialFutureEvents.some(
                futureEvent => {
                    const isAfter = moment(futureEvent.start).isAfter(event.end);
                    const sameDayOfWeek = moment(futureEvent.start).day() === eventDayOfWeek;
                    const sameStartTime = moment(futureEvent.start).format('HH:mm') === startTime;
                    const sameEndTime = moment(futureEvent.end).format('HH:mm') === endTime;

                    console.log(`Checking Future Event: ${futureEvent._id}`);
                    console.log(`  Is After: ${isAfter}`);
                    console.log(`  Same Day of Week: ${sameDayOfWeek} (${moment(futureEvent.start).day()} vs ${eventDayOfWeek})`);
                    console.log(`  Same Start Time: ${sameStartTime} (${moment(futureEvent.start).format('HH:mm')} vs ${startTime})`);
                    console.log(`  Same End Time: ${sameEndTime} (${moment(futureEvent.end).format('HH:mm')} vs ${endTime})`);

                    return isAfter && sameDayOfWeek && sameStartTime && sameEndTime;
            });

            console.log("future exists:", futureExists)

            // if there is nothing in the future and this event is still supposed to be fixed, extend it
            if (!futureExists) {
                eventsToExtend.push(event);
            }
        }
        // for (const event of fixedEvents) {
        //     const eventDayOfWeek = moment(event.start).day(); // Get day of week
        //     const startTime = moment(event.start).format('HH:mm');
        //     const endTime = moment(event.end).format('HH:mm');
        //
        //     // Check if there are future instances for this event
        //     const futureExists = await Timeslot.exists({
        //         createdById: userId,
        //         isFixed: true,
        //         start: {
        //             $gte: end.toDate(),
        //             $expr: {
        //                 $and: [
        //                     { $eq: [{ $dayOfWeek: "$start" }, eventDayOfWeek] },
        //                     { $eq: [{ $hour: "$start" }, parseInt(startTime.split(':')[0])] },
        //                     { $eq: [{ $minute: "$start" }, parseInt(startTime.split(':')[1])] },
        //                     { $eq: [{ $hour: "$end" }, parseInt(endTime.split(':')[0])] },
        //                     { $eq: [{ $minute: "$end" }, parseInt(endTime.split(':')[1])] }
        //                 ]
        //             }
        //         }
        //     });
        //
        //     if (!futureExists) {
        //         eventsToExtend.push(event);
        //     }
        // }

        console.log("eventstoextend:", eventsToExtend.length)

        console.log("existed fixed event:", fixedEvents.length)


        // Generate future instances for all events that need extending
        if (eventsToExtend.length > 0) {
            // first get existing timeslots
            let existingTimeslots: ITimeslot[] = [];
            try {
                // Asynchronously get existing timeslots
                existingTimeslots = await getEventsDirect(userId);
                console.log("existing timeslots:", existingTimeslots.length)

            } catch (error) {
                console.error("Error fetching existing timeslots:", error);
                existingTimeslots = []; // Continue with empty array if error
            }

            const futureInstances = await generateWeeklyInstances(eventsToExtend, existingTimeslots, moment(start), moment(end).add(6, 'months'));

            console.log("generated fixed event:", futureInstances.length)

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


        res.status(201).json({message: "Extended fixed slots successfully"});
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
        const {event, deleteAllFuture} = req.body;
        const startTime = new Date(event.start);
        const endTime = new Date(event.end);
        const {title, isFixed} = event;

        // Delete the specific event
        const deletedOne = await Timeslot.deleteOne({start: startTime, end: endTime, createdById: userId});

        console.log(event, deletedOne)
        console.log("delete all", deleteAllFuture)

        // If the event is fixed, delete its future instances
        if (isFixed && deleteAllFuture) {
            const weekday = (startTime.getDay() + 1) % 7 || 7; // Convert 0 (Sunday in JS) to 7 for MongoDB
            const futureStartDate = moment(startTime).add(1, 'week');
            await Timeslot.deleteMany({
                createdById: userId,
                title,
                isFixed: true,
                start: {$gte: futureStartDate.toDate()},
                $and: [
                    {
                        $or: [ // Start time is within the base event duration
                            {start: {$gte: startTime}},
                            {start: {$lt: endTime}}
                        ]
                    },
                    {
                        $or: [ // End time is within the base event duration
                            {end: {$gt: startTime}},
                            {end: {$lte: endTime}}
                        ]
                    }
                ],
                $expr: {
                    $eq: [{$dayOfWeek: "$start"}, weekday] // Ensure it's the same day of the week
                }
            })


            // update all previous ones to make them not fixed
            await Timeslot.updateMany({
                createdById: userId,
                title,
                isFixed: true,
                start: {$lt: startTime},
                $and: [
                    {
                        $or: [ // Start time is within the base event duration
                            {start: {$gte: startTime}},
                            {start: {$lt: endTime}}
                        ]
                    },
                    {
                        $or: [ // End time is within the base event duration
                            {end: {$gt: startTime}},
                            {end: {$lte: endTime}}
                        ]
                    }
                ],
                $expr: {
                    $eq: [{$dayOfWeek: "$start"}, weekday] // Ensure it's the same day of the week
                }
            }, { $set: { isFixed: false } });
        }

        res.status(200).json({message: 'Timeslot deleted successfully'});
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

// PATCH Timeslot Endpoint, not used
export const updateTimeslot: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.userId;
        const {event, updateAllFuture} = req.body;
        const newStart = new Date(req.body.newStart);
        const newEnd = new Date(req.body.newEnd);
        const {_id, start, end, isFixed} = event;

        // Adjust day of week to match MongoDB's indexing (1-7)


        // Update only the specific event
        if (!updateAllFuture) {
            await Timeslot.updateOne(
                {_id: _id, createdById: userId},
                // then it no longer is a fixed event
                {$set: {start: newStart, end: newEnd, isFixed: false}}
            );
        } else if (isFixed && updateAllFuture) {
            // Parse original start and end times to match exact future instances
            const originalStart = new Date(start);
            const originalEnd = new Date(end);
            const dayOfWeek = (originalStart.getDay() + 1) % 7 || 7;

            // Update all future events
            // const dayOfWeek = (newStart.getDay() + 1) % 7 || 7;
            const futureStartDate = moment(newStart).startOf('week');

            const matchConditions = {
                createdById: userId,
                title: event.title,
                isFixed: true,
                start: {$gte: originalStart},
                $expr: {
                    $and: [
                        {$eq: [{$hour: "$start"}, originalStart.getHours()]},
                        {$eq: [{$minute: "$start"}, originalStart.getMinutes()]},
                        {$eq: [{$hour: "$end"}, originalEnd.getHours()]},
                        {$eq: [{$minute: "$end"}, originalEnd.getMinutes()]},
                        {$eq: [{$dayOfWeek: "$start"}, dayOfWeek]}
                    ]
                }
            };

            await Timeslot.updateMany(
                {
                    createdById: userId,
                    title: event.title,
                    isFixed: true,
                    start: {$gte: futureStartDate.toDate()},
                    $expr: {$eq: [{$dayOfWeek: "$start"}, dayOfWeek]}
                },
                {$set: {start: newStart, end: newEnd}}
            );
        }

        res.status(200).json({message: 'Timeslot updated successfully'});
    } catch (err: any) {
        console.error("Error updating timeslot:", err);
        res.status(500).json({
            error: "Internal server error",
            message: err.message || "An error occurred"
        });
    }
};

// Existing Get Events Controller (updated code)
export const getEvents: RequestHandler = async (req, res, next) => {
    const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
    const { start, end } = req.query; // Extracting start and end dates from the query parameters

    console.log("getEvents backend query:", start, end)

    try {
        //
        const timeslots = await getEventsDirect(userId, start as string, end as string)
        res.json(timeslots);
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({error: 'Internal Server Error', message: err.message});
    }
};

// Define a function to fetch timeslots
async function getEventsDirect(userId: any, start?: string, end?: string) {
    try {
        const query: any = { createdById: userId};

        if (start && end) {
            query.$and = [
                { createdById: userId }, // reiterate for clarity in combined query structure
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

        const timeslots = Timeslot.find(query);
        return timeslots;
    } catch (error) {
        console.error("Error fetching timeslots for user:", error);
        throw error; // Rethrow to handle it in the calling function
    }
}

// merge overlapping timeslots
// const mergeAndCleanTimeslots = async (providerId: string) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const timeslots: ITimeslot[] = await Timeslot.find({
//             createdById: providerId,
//             isBooked: false
//         }).session(session);
//
//         if (!timeslots.length) {
//             await session.commitTransaction();
//             session.endSession();
//             return;
//         }
//
//         // Sort timeslots by start time
//         timeslots.sort((a, b) => a.start.getTime() - b.start.getTime());
//
//         const merged = [];
//         let last = timeslots[0];
//
//         // loop through the timeslots to find overlapping ones
//         for (let i = 1; i < timeslots.length; i++) {
//             if (timeslots[i].start <= last.end) {
//                 last.end = new Date(Math.max(last.end.getTime(), timeslots[i].end.getTime()));
//                 // Mark the current timeslot for deletion since it's merged
//                 await Timeslot.findByIdAndDelete(timeslots[i]._id, { session });
//             } else {
//                 merged.push(last);
//                 last = timeslots[i];
//             }
//         }
//         merged.push(last); // Push the last processed timeslot
//
//         // Ensure the last timeslot has the updated end time in the database
//         await Timeslot.findByIdAndUpdate(last._id, { end: last.end }, { session });
//
//         await session.commitTransaction();
//         session.endSession();
//         return merged; // Optional: return the merged timeslots for verification/testing
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         throw error;
//     }
// };


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


// get events by user ID (i.e. of a provider) for booking, this is ADJUSTED for transit time!
export const getAvailabilityByProviderId: RequestHandler = async (req, res, next) => {
    // const userId = (req as any).user.userId; // consumer id
    const {providerId} = req.params;
    const transitTime = parseInt(req.query.transitTime as string); // Get the transit time from query params
    console.log(req.query, "transit Time: ", transitTime)
    if (isNaN(transitTime)) {
        console.log("invalid transit time!")
        return res.status(400).json({error: 'Invalid transit time provided'});
    }

    try {
        // handle both string and objectId
        const providerIdConditions = [
            {createdById: providerId}, // Assuming it's a string or matches the ObjectId format
            {createdById: new Types.ObjectId(providerId)} // Explicitly cast to ObjectId
        ];

        // Fetch all future timeslots for the provider
        const timeslots: ITimeslot[] = await Timeslot.find({
            start: {$gte: new Date()},
            // createdById: providerId,
            $or: providerIdConditions,
            isBooked: false,
        }).lean();

        // Merge contiguous and overlapping timeslots
        // (maybe todo: replace/delete this once the mergeandclean is done)
        const mergedTimeslots: ITimeslot[] = mergeTimeslots(timeslots);

        // Adjust for transit time
        const adjustedTimeslots = adjustForTransit(mergedTimeslots, transitTime);

        // console.log("adjusted timeslots:", adjustedTimeslots);
        res.json(adjustedTimeslots);
    } catch (error: any) {
        console.error("Error fetching timeslots:", error);
        res.status(500).json({error: 'Internal Server Error', message: error.message});
    }
};

// Updated Save Events Controller
export const saveEvents: RequestHandler = async (req, res, next) => {
    try {
        console.log(req)
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const {events} = req.body;
        console.log('events to save:', events);

        // Generate future instances for new fixed events
        const fixedEvents = events.filter((event: ITimeslot) => event.isFixed);

        let futureInstances: ITimeslot[] = [];
        if (fixedEvents.length > 0) {
            let existingTimeslots: ITimeslot[] = [];
            try {
                console.log("now getting all events")
                // Asynchronously get existing timeslots
                existingTimeslots = await getEventsDirect(userId);
            } catch (error) {
                console.error("Error fetching existing timeslots:", error);
                existingTimeslots = []; // Continue with empty array if error
            }
            const futureEndDate = moment(fixedEvents[0].end).endOf('week').add(6, 'months');
            futureInstances = await generateWeeklyInstances(fixedEvents, existingTimeslots, moment(fixedEvents[0].start).add(1, 'week'), futureEndDate);
        }

        // Insert new events
        const allEventsToInsert = [...events, ...futureInstances];
        // console.log('All events to insert:', allEventsToInsert);
        const insertedEvents = await Timeslot.insertMany(allEventsToInsert.map(event => ({
            title: event.title,
            start: event.start,
            end: event.end,
            isFixed: event.isFixed,
            isBooked: event.isBooked,
            requestId: event.requestId,
            createdById: userId, // Use userId from the token
            // baseEventId: event.baseEventId || undefined,
        })), {ordered: false});

        console.log(insertedEvents)
        res.status(201).json({insertedEvents});
    } catch (err) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
            console.log(message)
        }
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
};

// Existing Get Events Controller (updated code)
export const getEventsByProvider: RequestHandler = async (req, res, next) => {
    const {providerId} = req.params;
    try {
        const timeslots = await Timeslot.find({createdById: providerId});
        res.json(timeslots);
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({error: 'Internal Server Error', message: err.message});
    }
};
export const turnExistingEventIntoFixed: RequestHandler = async (req, res, next) => {
    try {
        console.log(req)
        const userId = (req as any).user.userId; // Assuming userId is available in the request (e.g., from authentication middleware)
        const event = req.body;
        console.log(req.body)
        console.log('events to save in turnExistingEventIntoFixed:', event);


        // Step 1: Find and update the specified event to mark it as fixed
        const eventToUpdate = await Timeslot.findOneAndUpdate({
            _id: event._id,
            createdById: userId,
        }, {
            $set: {isFixed: true}
        }, {new: true}); // Return the updated document

        console.log('fixed events to update:', eventToUpdate);

        if (!eventToUpdate) {
            return res.status(404).json({message: "Event not found or user mismatch"});
        }

        console.log('fixed events to update:', eventToUpdate);


        // Step 2: Generate future instances based on the newly fixed event
        // const fixedEvents = events.filter((event: ITimeslot) => event.isFixed);
        let futureInstances: ITimeslot[] = [];
        if (eventToUpdate.isFixed) {
            const futureEndDate = moment(eventToUpdate.end).endOf('week').add(6, 'months');
            let existingTimeslots: ITimeslot[] = [];
            try {
                // Asynchronously get existing timeslots
                existingTimeslots = await getEventsDirect(userId);
                console.log("existing timeslots for turning into fixed:", existingTimeslots.length)
            } catch (error) {
                console.error("Error fetching existing timeslots:", error);
                existingTimeslots = []; // Continue with empty array if error
            }
            futureInstances = await generateWeeklyInstances([eventToUpdate], existingTimeslots, moment(eventToUpdate.start).add(1, 'week'), futureEndDate);
            console.log("turn into fixed: future instances", futureInstances.length)
        }

        // Insert new events
        // console.log('All events to insert:', allEventsToInsert);
        const insertedEvents = await Timeslot.insertMany(futureInstances.map(instance => ({
            title: instance.title,
            start: instance.start,
            end: instance.end,
            isFixed: instance.isFixed,
            isBooked: instance.isBooked,
            requestId: instance.requestId,
            createdById: userId, // Use userId from the token
            // baseEventId: event.baseEventId || undefined,
        })), {ordered: false});

        console.log(insertedEvents)
        res.status(201).json({
            message: "Event marked as fixed and future instances created successfully",
            updatedEvent: eventToUpdate,
            futureEvents: insertedEvents
        });
    } catch (err) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
            console.log(message)
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


export const checkAvailability: RequestHandler = async (req, res) => {
    const {start, end, createdById} = req.params;

    const startTime = new Date(start);
    const endTime = new Date(end);

    try {
        // Fetch all unbooked timeslots for the provider that might overlap with the requested timeframe
        const timeslots = await Timeslot.find({
            createdById: createdById,
            isBooked: false,
            end: {$gt: start},
            start: {$lt: end},
            // $or: [
            //     { start: { $lte: new Date(end) } },
            //     { end: { $gte: new Date(start) } }
            // ]
        });

        // let covered = new Date(start);

        const merged = mergeTimeslots(timeslots)

        for (const slot of merged) {
            if (slot.start <= startTime && slot.end >= endTime) {
                res.status(200).json({isAvailable: true});
                return;
            }
        }// Try to merge these timeslots to cover the entire requested period
        res.status(200).json({isAvailable: false});
    } catch (error: any) {
        console.error("Error checking timeslot availability:", error);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
};


export const bookTimeslot: RequestHandler = async (req, res, next) => {
    // const userId = (req as any).user.userId; // consumer id
    console.log(req.body)
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
    } = req.body;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Find overlapping timeslots
        const overlappingSlots = await Timeslot.find({
            createdById: createdById,
            end: {$gt: transitStart},
            start: {$lt: transitEnd},
            isBooked: false // assuming only unbooked slots are modifiable
        }).session(session);

        console.log("overlaps: ", start, end);

        if (overlappingSlots.length <= 0) {
            // If there are any booked overlaps, abort the transaction
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({message: "no timeslot, Timeslot is no longer available."});
        }

        // check availability
        let available = false;
        const merged = mergeTimeslots(overlappingSlots)

        console.log("merged", merged)

        for (const slot of merged) {
            // if we find one unbooked slot that covers the booking duration, it is good
            if (slot.start <= new Date(transitStart) && slot.end >= new Date(transitEnd)) {
                console.log("good!")
                available = true;
                break;
            }
        }

        if (!available) {
            if (!isUpdate) {
                await session.abortTransaction();
                session.endSession();
                return res.status(409).json({message: "Timeslot is no longer available."});
            } else {
                throw new Error("Timeslot is no longer available.")
            }
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

        // save the new timeslot
        await newTimeslot.save({session});

        // Adjust timeslots based on the booked time
        for (const slot of overlappingSlots) {
            if (moment(new Date(slot.start)).isSame(moment(new Date(transitStart))) && moment(new Date(slot.end)).isSame(moment(new Date(transitEnd)))) {
                // Case where the new slot exactly matches the existing one, remove the old slot
                await Timeslot.findByIdAndDelete(slot._id, {session});
            } else if (moment(new Date(slot.start)).isBefore(moment(new Date(transitStart))) &&
                moment(new Date(slot.end)).isAfter(moment(new Date(transitEnd)))) {
                console.log("need to split!")

                // Split the timeslot into two parts before and after the booked slot
                await Timeslot.create([{
                    start: slot.start,
                    end: transitStart,
                    title: "available",
                    isFixed: false, //todo: not sure if this should be true if the original timeslot is fixed
                    createdById: slot.createdById,
                    isBooked: false
                }, {
                    start: transitEnd,
                    end: slot.end,
                    title: "available",
                    isFixed: false,
                    createdById: slot.createdById,
                    isBooked: false
                }], {session});
                // Remove the original slot
                await Timeslot.findByIdAndDelete(slot._id, {session});

            } else {
                // Adjust existing slot start or end
                if (moment(new Date(slot.end)).isAfter(moment(new Date(transitEnd)))) {
                    slot.start = transitEnd;
                } else if (moment(new Date(slot.start)).isBefore(moment(new Date(transitStart)))) {
                    slot.end = transitStart;
                }
                await slot.save({session});
            }
        }

        await session.commitTransaction();

        res.status(201).json(newTimeslot);
    } catch (error: any) {
        await session.abortTransaction();
        console.error("Failed to book timeslot:", error);

        // delete the corresponding request if there is an error in saving timeslots
        if (!isUpdate) {
            if (requestId) {
                try {
                    await ServiceRequest.findByIdAndDelete(requestId).session(session);
                    console.error('Rolled back the created request due to timeslot booking failure.');
                } catch (deleteError) {
                    console.error('Failed to delete the request:', deleteError);
                }
            }
            if (error.response?.status === 409) {
                return res.status(409).json({message: "Timeslot is no longer available."});
            }

            res.status(500).json({message: "Failed to book timeslot", error: error.message});
        } else {
            throw error
        }
    } finally {
        session.endSession();
    }
};

// Cancel Timeslot Endpoint
export const cancelTimeslot: RequestHandler = async (req, res) => {
    const {timeslotId} = req.params;

    try {
        const updatedTimeslot = await cancelTimeslotDirect(timeslotId);
        res.status(200).json({message: "Timeslot cancelled successfully", updatedTimeslot});
    } catch (error: any) {
        console.error("Error cancelling timeslot:", error);
        res.status(500).json({message: "Failed to cancel timeslot", error: error.message});
    }
};


// direct method
export async function cancelTimeslotWithRequestId(requestId: string): Promise<{ success: boolean, message: string }> {
    try {
        const foundTimeslot = await findTimeslotByRequestId(requestId);
        if (!foundTimeslot) {
            console.log(`No timeslot found with requestId: ${requestId}, proceeding without cancellation.`);
            return {success: true, message: "No timeslot to cancel, proceeding..."};
        }

        // @ts-ignore
        await cancelTimeslotDirect(foundTimeslot._id);
        return {success: true, message: "Timeslot cancelled successfully"};
    } catch (error) {
        console.error("Error cancelling timeslot:", error);
        throw new Error("Failed to cancel timeslot");
    }
}

// update the timeslot to add jobid
export async function updateTimeslotWithRequestId(requestId: string, jobId: string): Promise<{ success: boolean, message: string }> {
    try {
        const foundTimeslot = await findTimeslotByRequestId(requestId);
        if (!foundTimeslot) {
            console.log(`No timeslot found with requestId: ${requestId}`);
            return {success: false, message: "No timeslot to cancel, proceeding..."};
        }

        foundTimeslot.jobId = new Types.ObjectId(jobId)

        const updatedTimeslot = await foundTimeslot.save();
        console.log("Timeslot updated successfully with the job", foundTimeslot)
        return {success: true, message: "Timeslot updated successfully with the job"}; // Return the updated timeslot for further processing or response
    } catch (error) {
        console.error("Error cancelling timeslot:", error);
        throw new Error("Failed to cancel timeslot");
    }
}

// API endpoint
// export const cancelTimeslotWithRequestId: RequestHandler = async (req, res, next) => {
//     const {requestId} = req.params;
//
//     try {
//         // Await the finding of the timeslot by requestId
//         const foundTimeslot = await findTimeslotByRequestId(requestId);
//
//         // If no timeslot is found, just proceed without cancellation
//         if (!foundTimeslot) {
//             console.log(`No timeslot found with requestId: ${requestId}, proceeding without cancellation.`);
//             // return res.status(200).json({message: "No timeslot to cancel, proceeding..."});
//             next();
//             return;
//         }
//         // console.log(foundTimeslot._id)
//
//         // @ts-ignore
//         const updatedTimeslot = await cancelTimeslotDirect(foundTimeslot._id);
//         console.log("updated timeslot")
//         next();
//         // res.status(200).json({message: "Timeslot cancelled successfully", updatedTimeslot});
//     } catch (error: any) {
//         console.error("Error cancelling timeslot:", error);
//         next(error);
//         // res.status(500).json({message: "Failed to cancel timeslot", error: error.message});
//     }
// };

// export const cancelTimeslotByRequestId: RequestHandler = async (req, res) => {
//     const {requestId} = req.params;
//
//     try {
//         const timeslotId = await Timeslot.findOne({request:requestId})
//         const updatedTimeslot = await cancelTimeslotDirect(timeslotId);
//         res.status(200).json({message: "Timeslot cancelled successfully", updatedTimeslot});
//     } catch (error: any) {
//         console.error("Error cancelling timeslot:", error);
//         res.status(500).json({message: "Failed to cancel timeslot", error: error.message});
//     }
// };

export async function cancelTimeslotDirect(timeslotId: String | Types.ObjectId) {
    try {
        console.log(timeslotId)
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

        timeslot.title = "available"
        timeslot.transitStart = undefined;
        timeslot.transitEnd = undefined;
        timeslot.isBooked = false;
        timeslot.requestId = undefined;
        timeslot.jobId = undefined;

        const updatedTimeslot = await timeslot.save();
        return updatedTimeslot; // Return the updated timeslot for further processing or response
    } catch (error) {
        console.error("Failed to cancel timeslot:", error);
        throw error; // Rethrow the error to handle it in the caller function
    }
}


// find a timeslot by requestId
export async function findTimeslotByRequestId(requestId: String | Types.ObjectId): Promise<ITimeslot | null> {
    try {
        const timeslot = await Timeslot.findOne({requestId: requestId});
        if (!timeslot) {
            console.log(`No timeslot found for requestId: ${requestId}`);
            return null;
        }
        return timeslot;
    } catch (error) {
        // Log unexpected errors and return null instead of throwing
        console.error("Database error in findTimeslotByRequestId:", error);
        return null; // Or handle differently if critical
    }
}

// export const cancelTimeslot: RequestHandler = async (req, res) => {
//     const timeslotId = req.params;
//     // const session = await mongoose.startSession();
//     try {
//         // session.startTransaction();
//
//         // Find the timeslot and update isBooked to false
//         const updatedTimeslot = await Timeslot.findByIdAndUpdate(
//             timeslotId,
//             { $set: { isBooked: false, start: transitStart, end: transitEnd, transitStart: undefined, transitEnd: undefined} },
//             { new: true }
//         );
//
//         if (!updatedTimeslot) {
//             return res.status(404).json({ message: "Timeslot not found" });
//         }
//
//         // Merge and clean up timeslots after updating
//         // await mergeAndCleanTimeslots(updatedTimeslot.createdById, session);
//
//         // await session.commitTransaction();
//         res.status(200).json({ message: "Timeslot cancelled successfully" });
//     } catch (error: any) {
//         // await session.abortTransaction();
//         console.error("Error cancelling timeslot:", error);
//         res.status(500).json({ message: "Failed to cancel timeslot", error: error.message });
//     }
// };

const mergeAndCleanTimeslots = async (providerId: string | Types.ObjectId, session: mongoose.ClientSession) => {
    const timeslots: ITimeslot[] = await Timeslot.find({
        createdById: providerId
    }).sort({start: 1}).session(session);

    if (!timeslots.length) {
        return; // No timeslots to merge or clean
    }

    let i = 0;
    while (i < timeslots.length - 1) {
        let current = timeslots[i];
        let next = timeslots[i + 1];

        if (next.start <= current.end) { // There's an overlap
            if (current.isBooked !== next.isBooked) {
                if (next.end <= current.end) {
                    // Next is entirely within current
                    if (!next.isBooked) {
                        // Delete next if it's unbooked and fully overlapped
                        await Timeslot.findByIdAndDelete(next._id, {session});
                        timeslots.splice(i + 1, 1); // Remove from array
                        continue; // Skip incrementing i to recheck next pair
                    }
                } else {
                    // Partial overlap with different booking statuses
                    if (next.isBooked) {
                        // Trim the end of current if it's unbooked
                        if (!current.isBooked) {
                            current.end = next.start;
                            await Timeslot.findByIdAndUpdate(current._id, {end: current.end}, {session});
                        }
                    } else {
                        // Next extends beyond the end of a booked current
                        if (current.isBooked) {
                            next.start = current.end;
                            await Timeslot.findByIdAndUpdate(next._id, {start: next.start}, {session});
                        }
                    }
                }
            } else {
                // Extend current to include next if they have the same isBooked status
                current.end = new Date(Math.max(current.end.getTime(), next.end.getTime()));
                await Timeslot.findByIdAndUpdate(current._id, {end: current.end}, {session});
                // Delete next as it's now redundant
                await Timeslot.findByIdAndDelete(next._id, {session});
                timeslots.splice(i + 1, 1); // Remove from array
                continue; // Skip incrementing i to recheck next pair
            }
        }
        i++;
    }
};


// const mergeAndCleanTimeslots = async (providerId: string | Types.ObjectId, session: mongoose.ClientSession) => {
//     const timeslots: ITimeslot[] = await Timeslot.find({
//         createdById: providerId
//     }).sort({ start: 1 }).session(session);
//
//     if (!timeslots.length) {
//         return; // No timeslots to merge or clean
//     }
//
//     let merged = [timeslots[0]];
//
//     for (let i = 1; i < timeslots.length; i++) {
//         const current = timeslots[i];
//         let last = merged[merged.length - 1];
//
//         // Check if current timeslot overlaps with the last one in the merged list
//         if (current.start <= last.end) {
//             // Handle overlaps with different isBooked status
//             if (last.isBooked !== current.isBooked) {
//                 if (current.end <= last.end) {
//                     // Current timeslot is fully overlapped by a booked timeslot
//                     if (!current.isBooked) continue; // Skip adding this timeslot if it is not booked
//                 } else {
//                     // Partial overlap with different statuses
//                     if (current.isBooked) {
//                         // Adjust the end of the last unbooked slot
//                         if (!last.isBooked) last.end = current.start;
//                     } else {
//                         // Current slot is unbooked and extends beyond a booked slot
//                         if (last.isBooked) {
//                             // Start a new unbooked timeslot after the end of the booked slot
//                             // merged.push({
//                             //     ...current,
//                             //     start: last.end
//                             // });
//                             continue;
//                         }
//                     }
//                 }
//             }
//
//             // Extend the end time of the last timeslot if they are of the same booking status
//             if (last.isBooked === current.isBooked) {
//                 last.end = new Date(Math.max(last.end.getTime(), current.end.getTime()));
//             }
//         } else {
//             // No overlap
//             merged.push(current);
//         }
//     }
//
//     // Update timeslots in the database
//     await Timeslot.deleteMany({
//         createdById: providerId
//     }, { session }); // Remove all old timeslots
//
//     await Timeslot.insertMany(merged, { session }); // Insert updated/merged timeslots
// };


// helper function to calculate duration
const getDurationInMinutes = (start: Date, end: Date): number => {
    return (new Date(end).getTime() - new Date(start).getTime()) / 60000;
};


// get the next available timeslot
export const getNextAvailability: RequestHandler = async (req, res, next) => {
    const {providerId} = req.params;
    const transitTime = parseInt(req.query.transitTime as string) || 30;
    const defaultDuration = parseInt(req.query.defaultDuration as string) || 30;


    try {
        const providerIdConditions = [
            {createdById: providerId},
            {createdById: new Types.ObjectId(providerId)}
        ];

        const timeslots: ITimeslot[] = await Timeslot.find({
            $or: providerIdConditions,
            isBooked: false,
            start: {$gte: new Date()}
        }).sort({start: 1}).lean();

        // const mergedTimeslots = mergeTimeslots(timeslots);
        const adjustedTimeslots = adjustForTransit(timeslots, transitTime);

        const validTimeslots = adjustedTimeslots.filter(slot => {
            const duration = getDurationInMinutes(new Date(slot.start), new Date(slot.end));
            return duration >= defaultDuration;
        });

        if (validTimeslots.length > 0) {
            console.log("next availability:", validTimeslots[0])
            return res.json({nextAvailability: validTimeslots[0]});
        } else {
            return res.status(404).json({message: 'No available timeslots found'});
        }
    } catch (error: any) {
        console.error("Error fetching next availability:", error);
        res.status(500).json({error: 'Internal Server Error', message: error.message});
    }
};