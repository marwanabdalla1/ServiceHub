import { RequestHandler } from 'express';
import moment from 'moment';
import Timeslot, { ITimeslot } from '../models/timeslot'; 

// Function to generate weekly instances (existing code)
function generateWeeklyInstances(events: ITimeslot[], startDate: moment.Moment, endDate: moment.Moment) {
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
