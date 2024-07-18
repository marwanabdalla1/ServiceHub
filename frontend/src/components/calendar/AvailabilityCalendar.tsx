import React, {useState, useEffect} from 'react';
import {Calendar, dateFnsLocalizer, SlotInfo} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../calendarStyles.css';
import {NavigateAction, ToolbarProps} from 'react-big-calendar';
import {format, startOfWeek, endOfWeek, parseISO, getDay, getYear, startOfDay, endOfDay} from 'date-fns';
import {enUS} from '@mui/material/locale';
import {
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


import axios from 'axios';
import {useAuth} from '../../contexts/AuthContext';
import useAlert from "../../hooks/useAlert";
import {useLocation, useNavigate} from "react-router-dom";


const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse: parseISO,
    startOfWeek: () => startOfWeek(new Date(), {weekStartsOn: 1}),
    getDay,
    getYear,
    locales,
});

export interface TimeSlot {
    _id: string | undefined;
    start: Date;
    end: Date;
    transitStart?: Date;
    transitEnd?: Date;
    title: string;
    isFixed: boolean;
    isBooked: boolean;
    createdById: string;
    requestId?: string | undefined | null;
    jobId?: string | undefined | null;
    // baseEventId?: string
}

type RangeType = Date[] | { start: Date; end: Date };

interface ServiceScheduleProps {
    Servicetype: string;
    defaultSlotDuration: number;
}


function AvailabilityCalendar({Servicetype, defaultSlotDuration}: ServiceScheduleProps) {
    const [fetchedEvents, setFetchedEvents] = useState<TimeSlot[]>([]);


    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [deleteOptionDialogOpen, setDeleteOptionDialogOpen] = useState(false);
    const [viewBookedDialogOpen, setViewBookedDialogOpen] = useState(false);

    const [clashDialogOpen, setClashDialogOpen] = useState(false);
    const {token, account} = useAuth();

    const {triggerAlert, alert, closeAlert} = useAlert(5000);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const now = new Date();
        const start = startOfWeek(now, {weekStartsOn: 1}); // Assumes week starts on Monday
        const end = endOfWeek(now, {weekStartsOn: 1}); // Adjust according to the end of the week
        fetchEvents(start, end)
    }, [token]); // Dependency array ensures this runs only when fetchedEvents changes


    /**
     * selecting a timeslot on the calendar
     * @param start: start of the timeslot
     * @param end: end of timeslot
     */
    const handleSelect = async ({start, end}: SlotInfo) => {
        const newTimeSlot: TimeSlot = {
            _id: undefined,
            start,
            end,
            title: 'available',
            isFixed: false,
            isBooked: false,
            createdById: ''
        };
        // see if there are already existing events at the time
        const isClashing =
            fetchedEvents.some(TimeSlot => {
                const newTimeSlotEnd = new Date(newTimeSlot.start.getTime() + defaultSlotDuration * 60000);
                if (TimeSlot.transitStart && TimeSlot.transitEnd) {
                    return (
                        (newTimeSlot.start < TimeSlot.transitEnd && newTimeSlot.end > TimeSlot.transitStart) ||
                        (newTimeSlot.start < TimeSlot.transitEnd && newTimeSlotEnd > TimeSlot.transitStart)
                    );
                } else {
                    return (
                        (newTimeSlot.start < TimeSlot.end && newTimeSlot.end > TimeSlot.start) ||
                        (newTimeSlot.start < TimeSlot.end && newTimeSlotEnd > TimeSlot.start)

                    );
                }

            });

        if (isClashing) {
            setClashDialogOpen(true);
        } else {
            // if the timeslot is smaller than the default slot duration, round it up to the default duration
            let adjustedEnd = end;
            if (end.getTime() - start.getTime() < defaultSlotDuration * 60000) {
                adjustedEnd = new Date(start.getTime() + defaultSlotDuration * 60000);
            }

            const adjustedTimeSlot: TimeSlot = {
                _id: undefined,
                start: start,
                end: adjustedEnd,
                title: 'available',
                isFixed: false,
                isBooked: false,
                createdById: account?._id || ''
            };
            setFetchedEvents([...fetchedEvents, adjustedTimeSlot]);

            try {
                // post/save the selected timeslot
                const response = await axios.post('/api/timeslots', {events: [adjustedTimeSlot]}, {
                    headers: {'Authorization': `Bearer ${token}`}
                });
                const savedTimeSlot = response.data.insertedEvents[0];

                // update the state
                setFetchedEvents([...fetchedEvents, {...adjustedTimeSlot, _id: savedTimeSlot._id}]);

            } catch (error) {
                triggerAlert("Error Saving Timeslot", "There was an error saving the timeslot, please try again later.", "error", 3000, "dialog")
            }
            ;
        }
    };


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
                setFetchedEvents(fetchedEvents.filter(a =>
                    !(a.start.getTime() === selectedTimeSlot.start.getTime() && a.end.getTime() === selectedTimeSlot.end.getTime())));
                setDeleteDialog(false);
                setDeleteOptionDialogOpen(false);
            }).catch(error => {
                triggerAlert("Error Deleting Timeslot", "There deleting an error saving the timeslot, please try again later.", "error", 3000, "dialog")
            });
        }
    };


    const handleSelectTimeSlot = (TimeSlot: TimeSlot) => {
        setSelectedTimeSlot(TimeSlot);
        if (TimeSlot.isBooked) {
            setViewBookedDialogOpen(true)
        } else {
            setActionDialogOpen(true);
        }
    };


    // set the selected timeslot to repeat on an weekly basis
    const handleFixWeekly = async () => {
        if (selectedTimeSlot) {
            try {
                const updatedTimeSlot = {
                    ...selectedTimeSlot,
                    isFixed: true,
                    createdById: account?._id
                };

                // Send the PATCH request
                const response = await axios.patch("/api/timeslots", updatedTimeSlot, {
                    headers: {'Authorization': `Bearer ${token}`} // Include auth token if needed
                });

                // update local state
                const newFetchedEvents = fetchedEvents.map(event =>
                    event._id === selectedTimeSlot._id ? {...event, isFixed: true} : event
                );

                setFetchedEvents(newFetchedEvents);


                // Close any open dialogs or UI elements
                setDeleteDialog(false);
                setActionDialogOpen(false);
            } catch (error) {
                triggerAlert("Error Updating Timeslot", "There deleting an error saving the timeslots, please try again later.", "error", 3000, "dialog")
            }
        }
    };


    const handleClashDialogClose = () => {
        setClashDialogOpen(false);
    };

    const handleViewBookedDialogClose = () => {
        setViewBookedDialogOpen(false);
    };

    const fetchEvents = async (start: Date, end: Date) => {
        try {
            const response = await axios.get('/api/timeslots', {
                headers: {'Authorization': `Bearer ${token}`},
                params: {start: start.toISOString(), end: end.toISOString()}
            });
            const allEvents = response.data.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                isBooked: event.isBooked,
                transitStart: event.transitStart ? new Date(event.transitStart) : undefined,
                transitEnd: event.transitEnd ? new Date(event.transitEnd) : undefined
            }));
            setFetchedEvents(allEvents)
        } catch (error) {
            console.error("Error fetching timeslots:", error);
        }
    };


    // go to the previous/next week
    const handleRangeChange = (range: RangeType) => {
        if (Array.isArray(range)) {
            const start = startOfDay(range[0]);
            const end = endOfDay(range[range.length - 1]);

            fetchEvents(start, end)

            // check if we need to extend the saved timeslots in the DB ( fixed events are saved for the upcoming 6 months until someone navigates to a time beyond that, then more future timeslots will be generated )
            axios.post('/api/timeslots/extend', {
                start: start,
                end: end,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(() => {
                // no need to fetch again
            }).catch(error => {
                console.error("Error extending fixed slots:", error);
            });
        }
    };

    // styling for the calendar
    const eventPropGetter = (event: TimeSlot) => {
        if (event.isBooked) {
            // Check for transit times and display them in a different color
            if (event.transitStart && event.transitEnd) {
                const transitStart = new Date(event.transitStart).getTime();
                const transitEnd = new Date(event.transitEnd).getTime();
                const eventStart = new Date(event.start).getTime();
                const eventEnd = new Date(event.end).getTime();

                const totalDuration = transitEnd - transitStart;
                const transitBeforeDuration = eventStart - transitStart;
                const transitAfterDuration = transitEnd - eventEnd;
                const eventDuration = eventEnd - eventStart;

                const beforePercent = (transitBeforeDuration / totalDuration) * 100;
                const eventPercent = (eventDuration / totalDuration) * 100;
                const afterPercent = (transitAfterDuration / totalDuration) * 100;

                return {
                    className: 'booked-event',
                    style: {
                        background: `linear-gradient(
                        to bottom,
                        lightblue ${beforePercent}%,
                        grey ${beforePercent}%,
                        grey ${beforePercent + eventPercent}%,
                        lightblue ${beforePercent + eventPercent}%
                    )`,
                        color: 'black',
                        opacity: 0.6,
                        zIndex: 1,
                    }
                };
            }

            // Default style for booked events without transit times
            return {
                className: 'booked-event',
                style: {
                    backgroundColor: 'grey',
                    // pointerEvents: 'none' as 'none',
                    opacity: 0.6,
                    zIndex: 1,
                }
            };
        }

        // Style for editable events, different for fixed vs non-fixed ones
        return {
            className: 'editable-event',
            style: {
                backgroundColor: event.isFixed ? 'purple' : 'blue',
                zIndex: 2,
            }
        };
    };


    const getStartAccessor = (event: TimeSlot) => {
        return event.transitStart ? new Date(event.transitStart) : new Date(event.start);
    };

    const getEndAccessor = (event: TimeSlot) => {
        return event.transitEnd ? new Date(event.transitEnd) : new Date(event.end);
    };

    // automatically scroll to the "work start" of the day
    const scrollToTime = new Date();
    scrollToTime.setHours(9, 0, 0, 0);


    // format the calendar to display month, day and year
    let formats = {
        dateFormat: 'dd',
        dayRangeHeaderFormat: ({start, end}: { start: Date, end: Date }, culture: any) =>
            `${localizer.format(start, 'MMM dd', culture)} — ${localizer.format(end, 'MMM dd, yyyy', culture)}`, // Short format for week range "Oct 01 — Oct 07"

    }


    const handleDrillDown = (event: any) => {
        // Prevent any drill down action to prevent errors (we only allow weekly view)
        return;
    };


    return (
        <div>
            <Calendar
                defaultView='week'
                views={['week']}
                step={15}
                localizer={localizer}
                scrollToTime={scrollToTime}
                events={fetchedEvents}
                startAccessor={getStartAccessor}
                endAccessor={getEndAccessor}
                style={{height: 520}}
                formats={formats}
                onDrillDown={handleDrillDown}
                selectable
                onSelectSlot={handleSelect}
                onSelectEvent={handleSelectTimeSlot}
                onRangeChange={handleRangeChange}
                eventPropGetter={eventPropGetter}
                className="bg-black-300"

            />
            <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
                <DialogTitle>Manage Timeslot
                    <IconButton
                        aria-label="close"
                        onClick={() => setActionDialogOpen(false)}
                        sx={{
                            position: 'sticky',
                            ml: 5,
                            right: 0,
                            top: 0,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <p>{selectedTimeSlot?.title}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialogOpen(false)}>Close</Button>
                    {selectedTimeSlot && !selectedTimeSlot.isFixed && (
                        <Button onClick={handleFixWeekly}>Repeat Weekly</Button>)}
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
                    The new timeslot clashes with an existing timeslot or is adjusted to meet the minimum slot duration.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClashDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>

            {/*dialogs for clicking on booked events*/}
            <Dialog open={viewBookedDialogOpen} onClose={handleViewBookedDialogClose}>
                <DialogTitle>Timeslot Booked</DialogTitle>
                <DialogContent>
                    <p>This timeslot is already booked. </p>

                    {selectedTimeSlot?.jobId && <p>Job ID: {selectedTimeSlot.jobId}</p>}
                    {selectedTimeSlot?.requestId && <p>Request ID: {selectedTimeSlot.requestId}</p>}
                    {!selectedTimeSlot?.jobId && !selectedTimeSlot?.requestId &&
                        <p>No specific job or request linked to this slot.</p>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewBookedDialogOpen(false)}>Close</Button>
                    {selectedTimeSlot?.jobId && (
                        <Button onClick={() => navigate(`/incoming/jobs/${selectedTimeSlot.jobId}`, {
                            state: {redirectPath: location}
                        })}>View Job Details</Button>
                    )}
                    {selectedTimeSlot?.requestId && (
                        <Button onClick={() => navigate(`/incoming/requests/${selectedTimeSlot.requestId}`, {
                            state: {redirectPath: location}
                        })}>View Request Details</Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AvailabilityCalendar;
