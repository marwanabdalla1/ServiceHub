import express from "express";
import { getEvents, saveEvents, extendFixedSlots} from "../controller/TimeSlotController";

const TimeSlotRouter = express.Router();

TimeSlotRouter.get("/", getEvents);
TimeSlotRouter.post("/", saveEvents);
TimeSlotRouter.post("/extend",extendFixedSlots)
export default TimeSlotRouter;
