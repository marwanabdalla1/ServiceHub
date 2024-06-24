import express from "express";
import { getEvents, saveEvents, extendFixedSlots, deleteTimeslot, getEventsByProvider } from "../controller/TimeSlotController";
import { authenticate } from "../middleware/authenticate";

const TimeSlotRouter = express.Router();

TimeSlotRouter.get("/", authenticate, getEvents);
TimeSlotRouter.get("/provider/:providerId", authenticate, getEventsByProvider);
TimeSlotRouter.post("/", authenticate, saveEvents);
TimeSlotRouter.post("/extend", authenticate, extendFixedSlots)
TimeSlotRouter.delete("/", authenticate, deleteTimeslot);
export default TimeSlotRouter;
