import express from "express";
import {
    bookTimeslot,
    cancelTimeslot,
    checkAvailability,
    deleteTimeslot,
    extendFixedSlots,
    getAvailabilityByProviderId,
    getEvents,
    getEventsByProvider,
    getNextAvailability,
    saveEvents,
    turnExistingEventIntoFixed
} from "../controller/TimeSlotController";
import {authenticate} from "../middleware/authenticate";

const TimeSlotRouter = express.Router();

TimeSlotRouter.get("/", authenticate, getEvents);
TimeSlotRouter.get("/provider/:providerId", authenticate, getEventsByProvider);

TimeSlotRouter.get("/next-availability/:providerId", getNextAvailability);

TimeSlotRouter.get("/:providerId", getAvailabilityByProviderId);


TimeSlotRouter.post("/", authenticate, saveEvents);
TimeSlotRouter.post("/extend", authenticate, extendFixedSlots)
TimeSlotRouter.delete("/", authenticate, deleteTimeslot);

TimeSlotRouter.post("/book", bookTimeslot);


TimeSlotRouter.patch('/', authenticate, turnExistingEventIntoFixed);
TimeSlotRouter.patch('/:timeslotId', authenticate, cancelTimeslot);
// TimeSlotRouter.patch('/cancel-with-request/:requestId', authenticate, cancelTimeslotWithRequestId);


TimeSlotRouter.get('/check-availability', checkAvailability);

export default TimeSlotRouter;
