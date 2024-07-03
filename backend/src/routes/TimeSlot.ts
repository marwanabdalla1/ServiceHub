import express from "express";
import {
    getEvents,
    saveEvents,
    extendFixedSlots,
    deleteTimeslot,
    getAvailabilityByProviderId, bookTimeslot, turnExistingEventIntoFixed, cancelTimeslot, checkAvailability
} from "../controller/TimeSlotController";
import {authenticate} from "../middleware/authenticate";

const TimeSlotRouter = express.Router();

TimeSlotRouter.get("/", authenticate, getEvents);
// TimeSlotRouter.get("/:providerId", authenticate, getEventsByProviderId);
TimeSlotRouter.get("/:providerId", getAvailabilityByProviderId);


TimeSlotRouter.post("/", authenticate, saveEvents);
TimeSlotRouter.post("/extend", authenticate, extendFixedSlots)
TimeSlotRouter.delete("/", authenticate, deleteTimeslot);

TimeSlotRouter.post("/book", bookTimeslot);


TimeSlotRouter.patch('/', authenticate, turnExistingEventIntoFixed);
TimeSlotRouter.patch('/:timeslotId', authenticate, cancelTimeslot);


TimeSlotRouter.get('/check-availability', checkAvailability);

export default TimeSlotRouter;
