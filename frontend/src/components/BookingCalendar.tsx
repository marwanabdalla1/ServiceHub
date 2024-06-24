import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendarStyles.css'; 
import { format, startOfWeek, parseISO, getDay, startOfDay, endOfDay } from 'date-fns';
import { enUS } from '@mui/material/locale';
import { Dialog, Button, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

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
    provider: string | undefined;
    request: string | undefined;
    Servicetype: string;
    defaultSlotDuration: number;
}

function BookingCalendar({ provider, request, Servicetype, defaultSlotDuration }: ServiceScheduleProps) {
    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [clashDialogOpen, setClashDialogOpen] = useState(false);
    const { token } = useAuth();
    const [oldTimeSlotStart, setOldTimeSlotStart] = useState<Date>(new Date());
    const [oldTimeSlotEnd, setOldTimeSlotEnd] = useState<Date>(new Date());
    const navigate = useNavigate();

    console.log(token);
    useEffect(() => {
        axios.get(`/api/timeslots/provider/${provider}`, {
            headers: {
                'Authorization': `Bearer ${token}`
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
    }, [token]);

    const saveBooking = () => {
        console.log('Submitted token' + token)
        try {

            // update the request
              const updateRequestData = {
               appointmentStartTime: oldTimeSlotStart,
               appointmentEndTime: oldTimeSlotEnd
              };
              console.log("selected request id:" , request, updateRequestData)
              axios.put(`/api/requests/${request}`, updateRequestData, {
                headers: {Authorization: `Bearer ${token}` }
              });
      
           } catch (error) {
            console.error('Error cancelling Request:', error);
          }
          navigate(`/jobs/requestHistory/`); 
    };

    const handleSelect = ({ start, end }: SlotInfo) => {
        
        const newTimeSlot: TimeSlot = { start, end, title: Servicetype, isFixed: false, isBooked: false, createdById: '' };
        const isClashing = availability.some(TimeSlot => (newTimeSlot.start >= TimeSlot.start && newTimeSlot.start < TimeSlot.end && newTimeSlot.end > TimeSlot.start && newTimeSlot.end <= TimeSlot.end)
        );
        availability.map((TimeSlot) => {
            if(newTimeSlot.start >= TimeSlot.start 
                && newTimeSlot.start < TimeSlot.end 
                && newTimeSlot.end > TimeSlot.start 
                && newTimeSlot.end <= TimeSlot.end) {
                    setOldTimeSlotStart(newTimeSlot.start);
                    setOldTimeSlotEnd(newTimeSlot.end);
                }
            });
        

        if (!isClashing) {
            setClashDialogOpen(true);
        } else {
            let adjustedEnd = end;

            if (end.getTime() - start.getTime() < defaultSlotDuration * 60000) {
                adjustedEnd = new Date(start.getTime() + defaultSlotDuration * 60000);
            }

            const adjustedTimeSlot: TimeSlot = { start: start, end: adjustedEnd, title: Servicetype, isFixed: false, isBooked: false, createdById: '' };
            setOldTimeSlotEnd(adjustedTimeSlot.end);
            setAvailability([...availability, adjustedTimeSlot]);
            console.log("Start Time: " + oldTimeSlotStart);
            console.log("End Time: " + oldTimeSlotEnd);
        }
    };

    const handleDelete = () => {
        if (selectedTimeSlot) {
            axios.delete('/api/timeslots', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
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
            const newTimeSlot: TimeSlot = { start: selectedTimeSlot.start, end: selectedTimeSlot.end, title: selectedTimeSlot.title, isFixed: true, isBooked: false, createdById: '' };
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
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(() => {
                    axios.get('/api/timeslots', {
                        headers: {
                            'Authorization': `Bearer ${token}`
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
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        start: start.toISOString(),
                        end: end.toISOString()
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
                className="bg-black-300" // Apply Tailwind class here
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
                <DialogTitle>TimeSlot Unavailable</DialogTitle>
                <DialogContent>
                    The new TimeSlot does not coincide with an available TimeSlot.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClashDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button variant="contained" color="primary" onClick={saveBooking}>
                    Save Booking
                </Button>
            </Box>
        </div>
    );
}

export default BookingCalendar;
