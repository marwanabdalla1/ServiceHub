import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendarStyles.css'; 
import { format, startOfWeek, parseISO, getDay, startOfDay, endOfDay } from 'date-fns';
import { enUS } from '@mui/material/locale';
import {Dialog, Button, DialogActions, DialogContent, DialogTitle, Box, FormControl, IconButton, TextField, InputAdornment} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

const DraggableCalendar = withDragAndDrop(Calendar);

import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import FormLabel from "@mui/joy/FormLabel";
import RadioGroup from "@mui/joy/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/joy/Radio";
import { v4 as uuidv4 } from 'uuid';


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
    // baseEventId?: string
}

type RangeType = Date[] | { start: Date; end: Date };

interface ServiceScheduleProps {
    Servicetype: string;
    defaultSlotDuration: number;
}


const DragAndDropCalendar = withDragAndDrop(Calendar)


function AvailabilityCalendar({ Servicetype, defaultSlotDuration }: ServiceScheduleProps) {
    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [fetchedEvents, setFetchedEvents] = useState<TimeSlot[]>([]);

    // const [bookedEvents, setBookedEvents] = useState<TimeSlot[]>([]);

    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteOption, setDeleteOption] = useState('single'); // 'single' or 'all'
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [deleteOptionDialogOpen, setDeleteOptionDialogOpen] = useState(false);

    const [clashDialogOpen, setClashDialogOpen] = useState(false);
    const { token } = useAuth();


    console.log(token);
    useEffect(() => {
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
            setFetchedEvents(events);
        }).catch(error => {
            console.error("Error fetching timeslots:", error);
        });
    }, [token]);
    //
    // const saveAvailability = () => {
    //     console.log('Submitted token' + token + availability)
    //     axios.post('/api/timeslots', {
    //         events: availability
    //     }, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`
    //         }
    //     }).then(response => {
    //         const { insertedEvents } = response.data;
    //         const savedEvents = insertedEvents.map((event: any) => ({
    //             ...event,
    //             start: new Date(event.start),
    //             end: new Date(event.end)
    //         }));
    //         setAvailability(savedEvents);
    //     }).catch(error => {
    //         console.error("Error saving availability:", error);
    //     });
    // };

    const handleSelect = ({ start, end }: SlotInfo) => {
        const newTimeSlot: TimeSlot = { start, end, title: 'available', isFixed: false, isBooked: false, createdById: '' };
        const isClashing = availability.some(TimeSlot =>
            (newTimeSlot.start < TimeSlot.end && newTimeSlot.end > TimeSlot.start)
        );
        //     || bookedEvents.some(TimeSlot =>
        //     (newTimeSlot.start < TimeSlot.end && newTimeSlot.end > TimeSlot.start)
        // );

        if (isClashing) {
            setClashDialogOpen(true);
        } else {
            let adjustedEnd = end;
            if (end.getTime() - start.getTime() < defaultSlotDuration * 60000) {
                adjustedEnd = new Date(start.getTime() + defaultSlotDuration * 60000);
            }

            const adjustedTimeSlot: TimeSlot = { start: start, end: adjustedEnd, title: 'available', isFixed: false, isBooked: false, createdById: '' };
            setAvailability([...availability, adjustedTimeSlot]);

            console.log(adjustedTimeSlot)


            axios.post('/api/timeslots', { events: [adjustedTimeSlot] }, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(error => {
                console.error("Error saving new timeslot:", error);
            });
        }
    };


    // const handleDelete = (deleteAllFuture = false) => {
    //     if (selectedTimeSlot) {
    //         const url = '/api/timeslots';
    //         const data = {
    //             event: selectedTimeSlot,
    //             deleteAllFuture: deleteAllFuture
    //         };
    //         axios.delete(url, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             data: data
    //         }).then(() => {
    //             setAvailability(availability.filter(a => {
    //                 if (deleteAllFuture) {
    //                     return a.start < selectedTimeSlot.start || a.title !== selectedTimeSlot.title;
    //                 }
    //                 return a.start !== selectedTimeSlot.start && a.end !== selectedTimeSlot.end;
    //             }));
    //             setDeleteDialog(false);
    //             setDeleteOptionDialogOpen(false);
    //
    //         }).catch(error => {
    //             console.error("Error deleting timeslot:", error);
    //         });
    //     }
    // };


    const handleDelete = (deleteAllFuture = false) => {
        if (selectedTimeSlot) {
            const url = '/api/timeslots';
            const data = {
                event: selectedTimeSlot,
                deleteAllFuture: selectedTimeSlot.isFixed && deleteAllFuture
            };
            axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: data
            }).then(() => {
                // setAvailability(availability.filter(a => {
                //     if (deleteAllFuture && selectedTimeSlot.isFixed) {
                //         const dayOfWeek = selectedTimeSlot.start.getDay();
                //         const startTime = selectedTimeSlot.start.getTime();
                //         const endTime = selectedTimeSlot.end.getTime();
                //
                //         // return !(a.start.getDay() === dayOfWeek &&
                //         //     a.start.getTime() === startTime &&
                //         //     a.end.getTime() === endTime &&
                //         //     a.start >= selectedTimeSlot.start);
                //         return !(a.isFixed &&
                //             a.start.getDay() === dayOfWeek &&
                //             a.start.getTime() >= startTime &&
                //             a.end.getTime() <= endTime);
                //     }
                //     return a !== selectedTimeSlot;
                // }));
                setFetchedEvents(fetchedEvents.filter(a => a.start !== selectedTimeSlot.start && a.end !== selectedTimeSlot.end));
                setDeleteDialog(false);
                setDeleteOptionDialogOpen(false);
            }).catch(error => {
                console.error("Error deleting timeslot:", error);
            });
        }
    };


    // const handleDelete = () => {
    //     if (selectedTimeSlot) {
    //         axios.delete('/api/timeslots', {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             data: { event: selectedTimeSlot }
    //         }).then(() => {
    //             setAvailability(availability.filter(a => a.start !== selectedTimeSlot.start && a.end !== selectedTimeSlot.end));
    //             setDeleteDialog(false);
    //         }).catch(error => {
    //             console.error("Error deleting timeslot:", error);
    //         });
    //     }
    // };

    // const renderDeleteDialog = () => {
    //     return (
    //         <Dialog open={deleteDialog} onClose={handleClose}>
    //             <DialogTitle>Delete Slot?</DialogTitle>
    //             <DialogContent>
    //                 {selectedTimeSlot && <p>{selectedTimeSlot.title}</p>}
    //                 {/* Add selection for deletion scope: this event only or all future events */}
    //                 <FormControl component="fieldset">
    //                     <FormLabel component="legend">Delete Options</FormLabel>
    //                     <RadioGroup
    //                         name="deleteOptions"
    //                         value={deleteOption}
    //                         onChange={(e) => setDeleteOption(e.target.value)}
    //                     >
    //                         <FormControlLabel value="single" control={<Radio />} label="Delete this event only" />
    //                         <FormControlLabel value="all" control={<Radio />} label="Delete all future events" />
    //                     </RadioGroup>
    //                 </FormControl>
    //             </DialogContent>
    //             <DialogActions>
    //                 <Button onClick={handleClose} color="primary">Cancel</Button>
    //                 <Button onClick={handleDelete} color="secondary">Delete</Button>
    //             </DialogActions>
    //         </Dialog>
    //     );
    // };
    //
    // const handleSelectTimeSlot = (TimeSlot: TimeSlot) => {
    //     setSelectedTimeSlot(TimeSlot);
    //     setDeleteDialog(true);
    // };

    const handleTimeChange = (field: any, value: any) => {
        if (selectedTimeSlot) {
            setSelectedTimeSlot({
                ...selectedTimeSlot,
                [field]: value
            });
        }
    };


    const handleSelectTimeSlot = (TimeSlot: TimeSlot) => {
        setSelectedTimeSlot(TimeSlot);
        setActionDialogOpen(true);
    };

    // const handleFixWeekly = () => {
    //     if (selectedTimeSlot) {
    //         // const baseEventId = uuidv4();
    //         const filteredAvailability = availability.filter(a => a.start !== selectedTimeSlot.start && a.end !== selectedTimeSlot.end);
    //         const newTimeSlot: TimeSlot = {
    //             start: selectedTimeSlot.start,
    //             end: selectedTimeSlot.end,
    //             title: selectedTimeSlot.title,
    //             isFixed: true,
    //             isBooked: false,
    //             createdById: '',
    //             // baseEventId: baseEventId
    //         };
    //
    //         console.log("new time slot: ", newTimeSlot)
    //
    //         setAvailability([...filteredAvailability, newTimeSlot]);
    //         console.log("availability: ", availability)
    //         setDeleteDialog(false);
    //         setActionDialogOpen(false);
    //         saveAvailability();
    //     }
    // };

    // updated
    const handleFixWeekly = async () => {
        if (selectedTimeSlot) {
            try {
                // Construct the URL for the PATCH request
                // const url = `/api/events/${selectedTimeSlot.id}/fixed`; // Assuming `id` is how you reference events

                const updatedTimeSlot = {
                    ...selectedTimeSlot,
                    isFixed: true
                };


                // Send the PATCH request
                const response = await axios.patch("/api/timeslots", updatedTimeSlot, {
                    headers: { 'Authorization': `Bearer ${token}` } // Include auth token if needed
                });

                // Log the response data or handle it as needed
                console.log("Updated and future instances added:", response.data);

                // Optionally fetch all events again to refresh the data
                // fetchEvents();

                // setFetchedEvents([...fetchedEvents, response.data])

                // Close any open dialogs or UI elements
                setDeleteDialog(false);
                setActionDialogOpen(false);
            } catch (error) {
                console.error("Error updating the event:", error);
            }
        }
    };


    const handleClose = () => {
        setDeleteDialog(false);
    };


    const handleClashDialogClose = () => {
        setClashDialogOpen(false);
    };


    const fetchEvents = async (start: Date, end: Date) => {
        try {
            const response = await axios.get('/api/timeslots', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { start: start.toISOString(), end: end.toISOString() }
            });
            const allEvents = response.data.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                isBooked: event.isBooked
            }));
            const bookedEvents = allEvents.filter((event: TimeSlot) => event.isBooked);
            const editableEvents = allEvents.filter((event: TimeSlot) => !event.isBooked);
            // setBookedEvents(bookedEvents);
            // setAvailability(editableEvents);
            setFetchedEvents(allEvents)
        } catch (error) {
            console.error("Error fetching timeslots:", error);
        }
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
                    // axios.get('/api/timeslots', {
                    //     headers: {
                    //         'Authorization': `Bearer ${token}`
                    //     }
                    // }).then(response => {
                    //     const events = response.data.map((event: any) => ({
                    //         ...event,
                    //         start: new Date(event.start),
                    //         end: new Date(event.end),
                    //         title: event.title,
                    //         isBooked: event.isBooked
                    //     }));
                    //     setAvailability(events);
                    // }).catch(error => {
                    //     console.error("Error fetching timeslots:", error);
                    // });

                    fetchEvents(start, end)
                }).catch(error => {
                    console.error("Error extending fixed slots:", error);
                });
            } else {
                // axios.get('/api/timeslots', {
                //     headers: {
                //         'Authorization': `Bearer ${token}`
                //     },
                //     params: {
                //         start: start.toISOString(),
                //         end: end.toISOString()
                //     }
                // }).then(response => {
                //     const events = response.data.map((event: any) => ({
                //         ...event,
                //         start: new Date(event.start),
                //         end: new Date(event.end),
                //         title: event.title,
                //         isBooked: event.isBooked
                //     }));
                //     setAvailability(events);
                // }).catch(error => {
                //     console.error("Error fetching timeslots:", error);
                // });
                fetchEvents(start, end)
            }
        }
    };

    // const eventPropGetter = (event: TimeSlot) => {
    //     const backgroundColor = event.isFixed ? 'purple' : 'blue';
    //     return { style: { backgroundColor } };
    // };

    const eventPropGetter = (event: TimeSlot) => {
        if (event.isBooked) {
            return { style: { backgroundColor: 'grey', pointerEvents: 'none' as 'none', opacity: 0.6 } };
        }
        return { style: { backgroundColor: event.isFixed ? 'purple' : 'blue' } };
    };






    return (
        <div>
            <Calendar
                defaultView='week'
                views={['week']}
                localizer={localizer}
                events={[...fetchedEvents, ...availability]}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                // onEventDrop={handleEventDrop}
                // onEventResize={handleEventResize}
                selectable
                onSelectSlot={handleSelect}
                onSelectEvent={handleSelectTimeSlot}
                onRangeChange={handleRangeChange}
                eventPropGetter={eventPropGetter}
                // backgroundEvents={bookedEvents}
                className="bg-black-300" // Apply Tailwind class here
            />
            {/*<Dialog open={deleteDialog} onClose={handleClose}>*/}
            {/*    <DialogTitle>Delete Slot?</DialogTitle>*/}
            {/*    <DialogContent>*/}
            {/*        {selectedTimeSlot && <p>{selectedTimeSlot.title}</p>}*/}
            {/*    </DialogContent>*/}
            {/*    <DialogActions>*/}
            {/*        <Button onClick={handleClose}>Cancel</Button>*/}
            {/*        <Button onClick={handleFixWeekly}>Repeat Weekly</Button>*/}
            {/*        <Button onClick={handleDelete} color="secondary">Delete</Button>*/}
            {/*    </DialogActions>*/}
            {/*</Dialog>*/}

            {/*the dialog for editing/managing events*/}
            <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
                <DialogTitle>Manage Time Slot
                    <IconButton
                        aria-label="close"
                        onClick={() => setActionDialogOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <p>{selectedTimeSlot?.title}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialogOpen(false)}>Close</Button>
                    {/* Include Edit button logic here if needed */}

                    <Button onClick={handleFixWeekly}>Repeat Weekly</Button>
                    <Button onClick={() => {
                        if (selectedTimeSlot?.isFixed) {
                            setDeleteOptionDialogOpen(true);  // Open delete options for fixed events
                        } else {
                            handleDelete();  // Directly delete for non-fixed events
                        }
                        setActionDialogOpen(false);
                    }} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>


            {/*delete confirmation dialog*/}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete This Slot?</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this slot?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={() => handleDelete()} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>

            {/*delete options for fixed events*/}
            <Dialog open={deleteOptionDialogOpen} onClose={() => setDeleteOptionDialogOpen(false)}>
                <DialogTitle>Delete Options</DialogTitle>
                <DialogContent>
                    This is a recurring event. Do you want to delete only this event or all future events?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOptionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleDelete(false)} color="secondary">Delete This Event Only</Button>
                    <Button onClick={() => handleDelete(true)} color="secondary">Delete All Future Events</Button>
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
            {/*<Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>*/}
                {/*<Button variant="contained" color="primary" onClick={saveAvailability}>*/}
                {/*    Save Availability*/}
                {/*</Button>*/}
            {/*</Box>*/}
        </div>
    );
}

export default AvailabilityCalendar;
