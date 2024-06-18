import express from "express";
import { getEvents, saveEvents} from "../controller/TimeSlotController";

const TimeSlotRouter = express.Router();

TimeSlotRouter.get("/", getEvents);
TimeSlotRouter.post("/", saveEvents);

export default TimeSlotRouter;
