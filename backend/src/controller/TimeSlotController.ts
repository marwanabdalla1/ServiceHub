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
        console.log(req.body)
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
        //Instead of deleting all the events, we could parse through the events in the db
        //and see what hasn't been there anymore and delete those, and if it's a fixed event
        //that has disappeared, we could delete all the future instances of that event
        //other
        await Timeslot.deleteMany({ createdById: events[0].createdById });

        const eventsToInsert = events.map((event: ITimeslot) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            isFixed: event.isFixed,
            isBooked: event.isBooked,
            createdById: event.createdById
        }));

        const fixedEvents = events.filter((event: ITimeslot) => event.isFixed);
        const regularEvents = events.filter((event: ITimeslot) => !event.isFixed);

        let futureInstances: ITimeslot[] = [];
        if (fixedEvents.length > 0) {
            const futureEndDate = moment(fixedEvents[0].end).endOf('week').add(6, 'months');
            futureInstances = generateWeeklyInstances(fixedEvents, moment(fixedEvents[0].start).add(1, 'week'), futureEndDate);
        }

        const allEventsToInsert = [...regularEvents, ...futureInstances];

        const insertedEvents = await Timeslot.insertMany(allEventsToInsert.map(event => ({
            title: event.title,
            start: event.start,
            end: event.end,
            isFixed: event.isFixed,
            isBooked: event.isBooked,
            createdById: event.createdById
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
