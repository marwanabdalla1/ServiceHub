import express from "express";
import { getEvents, saveEvents, extendFixedSlots, deleteTimeslot} from "../controller/TimeSlotController";

const TimeSlotRouter = express.Router();

TimeSlotRouter.get("/", getEvents);
TimeSlotRouter.post("/", saveEvents);
TimeSlotRouter.post("/extend",extendFixedSlots)
TimeSlotRouter.delete("/", deleteTimeslot);
export default TimeSlotRouter;
