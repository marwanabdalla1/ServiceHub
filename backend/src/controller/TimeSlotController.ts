import { RequestHandler } from 'express';
import moment from 'moment';
import Timeslot, { ITimeslot } from '../models/timeslot'; // Adjust the path as necessary

// Function to generate weekly instances
function generateWeeklyInstances(events: ITimeslot[], startDate: moment.Moment, endDate: moment.Moment) {
    const weekInstances: ITimeslot[] = [];
    console.log("To beFuture Events: ", events);
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
  
          weekInstances.push({ 
            title: event.title, 
            start, 
            end, 
            isFixed: event.isFixed, 
            isBooked: event.isBooked, 
            createdById: event.createdById 
          } as ITimeslot);
        }
  
        currentDate.add(1, 'week'); // Move to the same day in the next week
      }
    });
  
    return weekInstances;
}

// Get Events Controller
export const getEvents: RequestHandler = async (req, res, next) => {
    try {
      const { start, end } = req.query;
      const startDate = moment(start as string);
      const endDate = moment(end as string);
      const events = await Timeslot.find();
  
      // Check if the current week is within two weeks from now
      if (moment().add(2, 'weeks').isAfter(startDate)) {
        // Create fixed events for the next 6 months if needed
        const futureEndDate = moment().add(6, 'months');
        const futureInstances = generateWeeklyInstances(events, moment(), futureEndDate);
  
        // Insert future instances into the database
        await Timeslot.insertMany(futureInstances.map(instance => ({
          title: instance.title,
          start: instance.start,
          end: instance.end,
          isFixed: instance.isFixed,
          isBooked: instance.isBooked,
          createdById: instance.createdById
        })));
      }
  
      const weekInstances = generateWeeklyInstances(events, startDate, endDate);
      res.json(weekInstances);
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

// Save Events Controller
export const saveEvents: RequestHandler = async (req, res, next) => {
  try {
    const { events } = req.body;

    console.log('Received events:', events); // Debugging: Log the received events

    // Delete the timeslots with the same createdById and other matching fields
    for (const event of events) {
      await Timeslot.deleteMany({
        title: event.title,
        start: event.start,
        end: event.end,
        isFixed: event.isFixed,
        isBooked: event.isBooked,
        createdById: event.createdById
      });
    }

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
    await Timeslot.insertMany(eventsToInsert);

    // Parse the events and check if they are fixed
    const fixedEvents = events.filter((event: ITimeslot) => event.isFixed);

    // Save fixed events for the next week until 6 months in advance
    const futureEndDate = moment().add(6, 'months');
    const futureInstances = generateWeeklyInstances(fixedEvents, moment(), futureEndDate);

    await Timeslot.insertMany(futureInstances.map(instance => ({
      title: instance.title,
      start: instance.start,
      end: instance.end,
      isFixed: instance.isFixed,
      isBooked: instance.isBooked,
      createdById: instance.createdById // Ensure createdById is included here
    })));

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