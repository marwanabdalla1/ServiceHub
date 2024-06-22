import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo, EventProps } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, parseISO, getDay, startOfDay, endOfDay } from 'date-fns';
import { enUS } from '@mui/material/locale';
import { Dialog, Button, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import axios from 'axios';
import moment from 'moment';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse: parseISO,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

export interface TimeSlot {
    start: Date;
    end: Date;
    title: string;
    isFixed?: boolean;  // Optional property to indicate if the TimeSlot is fixed
    isBooked: boolean;
    createdById: string;
}

type RangeType = Date[] | { start: Date; end: Date };

interface ServiceScheduleProps {
    Servicetype: string;
    defaultSlotDuration: number;
    createdById: string;
}

function AvailabilityCalendar({ Servicetype, defaultSlotDuration, createdById }: ServiceScheduleProps) {
    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [clashDialogOpen, setClashDialogOpen] = useState(false);

    useEffect(() => {
        axios.get('/api/timeslots', {
            params: {
                createdById: createdById
            }
        }).then(response => {
            const events = response.data.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
            }));
            setAvailability(events);
        }).catch(error => {
            console.error("Error fetching timeslots:", error);
        });
    }, [createdById]);

    const saveAvailability = () => {
        axios.post('/api/timeslots', {
            events: availability
        }).then(response => {
            const { insertedEvents } = response.data;
            const savedEvents = insertedEvents.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
            }));
            setAvailability(savedEvents);
        }).catch(error => {
            console.error("Error saving availability:", error);
        });
    };

    const handleSelect = ({ start, end }: SlotInfo) => {
        const newTimeSlot: TimeSlot = { start, end, title: Servicetype, isFixed: false, isBooked: false, createdById };
        const isClashing = availability.some(TimeSlot =>
            (newTimeSlot.start < TimeSlot.end && newTimeSlot.end > TimeSlot.start)
        );

        if (isClashing) {
            setClashDialogOpen(true);
        } else {
            let adjustedEnd = end;
            if (end.getTime() - start.getTime() < defaultSlotDuration * 60000) {
                adjustedEnd = new Date(start.getTime() + defaultSlotDuration * 60000);
            }

            const adjustedTimeSlot: TimeSlot = { start: start, end: adjustedEnd, title: Servicetype, isFixed: false, isBooked: false, createdById };
            setAvailability([...availability, adjustedTimeSlot]);
        }
    };

    const handleDelete = () => {
        if (selectedTimeSlot) {
            axios.delete('/api/timeslots', {
                data: { event: selectedTimeSlot }
            }).then(() => {
                setAvailability(availability.filter(a => a.start !== selectedTimeSlot.start && a.end !== selectedTimeSlot.end));
                setDeleteDialog(false);
            }).catch(error => {
                console.error("Error deleting timeslot:", error);
            });
        }
    };

    const handleSelectTimeSlot = (TimeSlot: TimeSlot) => {
        setSelectedTimeSlot(TimeSlot);
        setDeleteDialog(true);
    };

    const handleFixWeekly = () => {
        if (selectedTimeSlot) {
            const filteredAvailability = availability.filter(a => a.start !== selectedTimeSlot.start && a.end !== selectedTimeSlot.end);
            const newTimeSlot: TimeSlot = { start: selectedTimeSlot.start, end: selectedTimeSlot.end, title: selectedTimeSlot.title, isFixed: true, isBooked: false, createdById };
            setAvailability([...filteredAvailability, newTimeSlot]);
            setDeleteDialog(false);
        }
    };

    const handleClose = () => {
        setDeleteDialog(false);
    };

    const handleClashDialogClose = () => {
        setClashDialogOpen(false);
    };

    const handleRangeChange = (range: RangeType) => {
        if (Array.isArray(range)) {
            const start = startOfDay(range[0]);
            const end = endOfDay(range[range.length - 1]);

            const lastDate = new Date(Math.max(...availability.map(slot => slot.end.getTime())));
            if (end > lastDate) {
                axios.post('/api/timeslots/extend', {
                    start: lastDate,
                    end: moment(lastDate).add(6, 'months').toDate(),
                    createdById: createdById
                }).then(() => {
                    axios.get('/api/timeslots', {
                        params: {
                            createdById: createdById
                        }
                    }).then(response => {
                        const events = response.data.map((event: any) => ({
                            ...event,
                            start: new Date(event.start),
                            end: new Date(event.end)
                        }));
                        setAvailability(events);
                    }).catch(error => {
                        console.error("Error fetching timeslots:", error);
                    });
                }).catch(error => {
                    console.error("Error extending fixed slots:", error);
                });
            } else {
                axios.get('/api/timeslots', {
                    params: {
                        start: start.toISOString(),
                        end: end.toISOString(),
                        createdById: createdById
                    }
                }).then(response => {
                    const events = response.data.map((event: any) => ({
                        ...event,
                        start: new Date(event.start),
                        end: new Date(event.end)
                    }));
                    setAvailability(events);
                }).catch(error => {
                    console.error("Error fetching timeslots:", error);
                });
            }
        }
    };

    const eventPropGetter = (event: TimeSlot) => {
        const backgroundColor = event.isFixed ? 'purple' : 'blue';
        return { style: { backgroundColor } };
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
                onSelectEvent={handleSelectTimeSlot}
                onRangeChange={handleRangeChange}
                eventPropGetter={eventPropGetter}
            />
            <Dialog open={deleteDialog} onClose={handleClose}>
                <DialogTitle>Delete Slot?</DialogTitle>
                <DialogContent>
                    {selectedTimeSlot && <p>{selectedTimeSlot.title}</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleFixWeekly}>Repeat Weekly</Button>
                    <Button onClick={handleDelete} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={clashDialogOpen} onClose={handleClashDialogClose}>
                <DialogTitle>TimeSlot Clash</DialogTitle>
                <DialogContent>
                    The new TimeSlot clashes with an existing TimeSlot.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClashDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button variant="contained" color="primary" onClick={saveAvailability}>
                    Save Availability
                </Button>
            </Box>
        </div>
    );
}

export default AvailabilityCalendar;
