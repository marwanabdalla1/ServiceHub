import React, { useState } from 'react';
import {Calendar, dateFnsLocalizer, SlotInfo} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, parseISO, getDay } from 'date-fns';
import { enUS } from "@mui/material/locale";
import { Dialog, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parseISO,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

interface Event {
    start: Date;
    end: Date;
    title: string;
    isFixed?: boolean;  // Optional property to indicate if the event is fixed
}


interface AvailabilityCalendarProps {
    isFixed: boolean;
}

function AvailabilityCalendar({ isFixed }: AvailabilityCalendarProps) {
    const [availability, setAvailability] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [open, setOpen] = useState(false);
    const [eventTitle, setEventTitle] = useState("");

    const handleSelect = ({ start, end }: SlotInfo) => {
        const newEvent: Event = { start, end, title: "New Event", isFixed: isFixed };
        setAvailability([...availability, newEvent]);
    };

    const handleSelectEvent = (event: Event) => {
        setSelectedEvent(event);
        setEventTitle(event.title);
        setOpen(true);
    };

    const handleDelete = () => {
        if (selectedEvent) {
            setAvailability(availability.filter(a => a.start !== selectedEvent.start && a.end !== selectedEvent.end));
            setOpen(false);
        }
    };

    const handleSave = () => {
        if (selectedEvent) {
            setAvailability(availability.map(a =>
                a.start === selectedEvent.start && a.end === selectedEvent.end ? { ...a, title: eventTitle } : a
            ));
            setOpen(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={availability}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable
                onSelectSlot={handleSelect}
                onSelectEvent={handleSelectEvent}>

            </Calendar>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Availability</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Event Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave} color="primary">Save</Button>
                    <Button onClick={handleDelete} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AvailabilityCalendar;