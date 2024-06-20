import { RequestHandler } from 'express';
import moment from 'moment';
import Timeslot, { ITimeslot } from '../models/timeslot'; // Adjust the path as necessary

// Function to generate weekly instances (existing code)
function generateWeeklyInstances(events: ITimeslot[], startDate: moment.Moment, endDate: moment.Moment) {
    const weekInstances: ITimeslot[] = [];
    console.log("To beFuture Events: ", events);
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

// New Endpoint to Extend Fixed Slots (existing code)
export const extendFixedSlots: RequestHandler = async (req, res, next) => {
    try {
        console.log("Extend function called")
        const { start, end, createdById } = req.body;
        console.log
        const startDate = moment(start).subtract(1, 'week');
        const endDate = moment(end).subtract(1, 'week');

        // Fetch existing fixed events within the one-week range before the start and end dates
        const fixedEvents = await Timeslot.find({ 
            createdById, 
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
            createdById: instance.createdById
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

//Add more logic that handles the delete logic of the fixed slots


// Existing Get Events Controller (existing code)
export const getEvents: RequestHandler = async (req, res, next) => {
    const { createdById } = req.query;
    try {
        const timeslots = await Timeslot.find({ createdById });
        res.json(timeslots);
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
}; 

// Existing Save Events Controller
export const saveEvents: RequestHandler = async (req, res, next) => {
    try {
        const { events } = req.body;
        console.log('Received events:', events); // Debugging: Log the received events

        await Timeslot.deleteMany({ createdById: events[0].createdById });

        // Log the events to be inserted
        const eventsToInsert = events.map((event: ITimeslot) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            isFixed: event.isFixed,
            isBooked: event.isBooked,
            createdById: event.createdById
        }));

        console.log('Events to insert:', eventsToInsert); // Debugging: Log the processed events

        // Save the new events
        await Timeslot.insertMany(eventsToInsert, { ordered: false });

        // Parse the events and check if they are fixed
        const fixedEvents = events.filter((event: ITimeslot) => event.isFixed);

        // Save fixed events for the next week until 6 months in advance
       // Save fixed events for the next week until the last day of the week of the submitted timeslots
       const futureEndDate = moment(events[0].end).endOf('week');
       const futureInstances = generateWeeklyInstances(fixedEvents, moment(events[0].start), futureEndDate);

        await Timeslot.insertMany(futureInstances.map(instance => ({
            title: instance.title,
            start: instance.start,
            end: instance.end,
            isFixed: instance.isFixed,
            isBooked: instance.isBooked,
            createdById: instance.createdById // Ensure createdById is included here
        })), { ordered: false });

        res.status(201).json({ message: "Events saved successfully" });
    } catch (err) {
        let message = '';
        if (err instanceof Error) {
            message = err.message;
        }
        console.error('Error saving events:', message); // Debugging: Log the error message
        return res.status(500).json({
            error: "Internal server error",
            message: message,
        });
    }
};
