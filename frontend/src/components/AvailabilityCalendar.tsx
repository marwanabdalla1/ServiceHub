import React, { useState } from 'react';
import {Calendar, dateFnsLocalizer, SlotInfo} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, parseISO, getDay, startOfDay, endOfDay } from 'date-fns';
import { enUS } from "@mui/material/locale";
import { Dialog, Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";

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

export interface Event {
    start: Date;
    end: Date;
    title: string;
    isFixed?: boolean;  // Optional property to indicate if the event is fixed
}

type RangeType = Date[] | { start: Date; end: Date };

interface ServiceScheduleProps {
    Servicetype: string;
    defaultSlotDuration: number;
}

function AvailabilityCalendar({Servicetype, defaultSlotDuration }: ServiceScheduleProps) {

    //TODO Add global availabilities from different services as a prop

    const [availability, setAvailability] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [DeleteDialog, setDeleteDialog] = useState(false);
    const [clashDialogOpen, setClashDialogOpen] = useState(false);

    const handleSelect = ({ start, end }: SlotInfo) => {
        const newEvent: Event = { start, end, title: Servicetype, isFixed: false };
        console.log(availability)
        // Check for event clash
        const isClashing = availability.some(event =>
            (newEvent.start < event.end && newEvent.end > event.start)
        );

        if (isClashing) {
            setClashDialogOpen(true);
        } else {
            // Adjust start and end times to include buffer and default slot duration
            
            let adjustedEnd = end
            if (end.getTime() - start.getTime() < defaultSlotDuration * 60000) {
                 adjustedEnd = new Date(start.getTime() + defaultSlotDuration * 60000);
            }

            const adjustedEvent: Event = { start: start, end: adjustedEnd, title: Servicetype, isFixed: false };
            setAvailability([...availability, adjustedEvent]);
        }
    };

   

    const handleDelete = () => {
        if (selectedEvent) {
            setAvailability(availability.filter(a => a.start !== selectedEvent.start && a.end !== selectedEvent.end));
            setDeleteDialog(false);
        }
    };


    const handleSelectEvent = (event: Event) => {
        setSelectedEvent(event);
        setDeleteDialog(true);
    };

    const handleFixWeekly = () => {
        if (selectedEvent) {
            const filteredAvailability = availability.filter(a => a.start !== selectedEvent.start && a.end !== selectedEvent.end);
            const newEvent: Event = { start: selectedEvent.start, end: selectedEvent.end, title: selectedEvent.title, isFixed: true };
            setAvailability([...filteredAvailability, newEvent]);
            setDeleteDialog(false);
        }
    }
    
    const handleClose = () => {
        setDeleteDialog(false);
    };

    const handleClashDialogClose = () => {
        setClashDialogOpen(false);
    };


    const handleRangeChange = (range: RangeType) => {
        if (Array.isArray(range)) {
          // range is a Date[]
          const start = startOfDay(range[0]);
          const end = endOfDay(range[range.length - 1]);
          console.log(start, end);
        } 
      };
 

    return (
        <div>
        <Calendar
             defaultView='week'
             views={['week']}
             localizer={localizer}
             events={availability}
             startAccessor="start"
             endAccessor="end"
             style={{ height: 500 }}
             selectable
             onSelectSlot={handleSelect}
             onSelectEvent={handleSelectEvent}
             onRangeChange={handleRangeChange}
             >


        </Calendar>
        <Dialog open={DeleteDialog} onClose={handleClose}>
            <DialogTitle>Delete Slot?</DialogTitle>
            <DialogContent>
                {selectedEvent && <p> {selectedEvent.title}</p>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleFixWeekly}>Repeat Weekly</Button>
                <Button onClick={handleDelete} color="secondary">Delete</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={clashDialogOpen} onClose={handleClashDialogClose}>
                <DialogTitle>Event Clash</DialogTitle>
                <DialogContent>
                    The new event clashes with an existing event.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClashDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>
    </div>

    );
            
        
    
}

export default AvailabilityCalendar;

function moment(arg0: Date): any {
    throw new Error('Function not implemented.');
}
