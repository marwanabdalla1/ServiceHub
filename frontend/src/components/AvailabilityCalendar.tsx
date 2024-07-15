import React, {useState, useEffect} from 'react';
import {Calendar, dateFnsLocalizer, SlotInfo} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendarStyles.css';
import { NavigateAction, ToolbarProps } from 'react-big-calendar';
import {format, startOfWeek,endOfWeek, parseISO, getDay, getYear, startOfDay, endOfDay} from 'date-fns';
import {enUS} from '@mui/material/locale';
import {
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    FormControl,
    IconButton,
    TextField,
    InputAdornment,
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';



import axios from 'axios';
import moment from 'moment';
import {useAuth} from '../contexts/AuthContext';
import {v4 as uuidv4} from 'uuid';
import useAlert from "../hooks/useAlert";
import AlertCustomized from "./AlertCustomized";
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
    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [fetchedEvents, setFetchedEvents] = useState<TimeSlot[]>([]);

    // const [bookedEvents, setBookedEvents] = useState<TimeSlot[]>([]);

    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

    // todo: editing
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editAllRecurring, setEditAllRecurring] = useState(false);


    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteOption, setDeleteOption] = useState('single'); // 'single' or 'all'
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [deleteOptionDialogOpen, setDeleteOptionDialogOpen] = useState(false);
    const [viewBookedDialogOpen, setViewBookedDialogOpen] = useState(false);

    const [clashDialogOpen, setClashDialogOpen] = useState(false);
    const {token, account} = useAuth();

    const {triggerAlert, alert, closeAlert} = useAlert(5000);
    const navigate = useNavigate();
    const location = useLocation();

    console.log(token);
    useEffect(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 }); // Assumes week starts on Monday
        const end = endOfWeek(now, { weekStartsOn: 1 }); // Adjust according to the end of the week
        fetchEvents(start, end)
    }, [token]); // Dependency array ensures this runs only when fetchedEvents changes

    useEffect(() => {
        console.log("Updated fetched events:", fetchedEvents);
    }, [fetchedEvents]);


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
        const isClashing = /*[...fetchedEvents, ...availability]*/
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
            let adjustedEnd = end;
            if (end.getTime() - start.getTime() < defaultSlotDuration * 60000) {
                adjustedEnd = new Date(start.getTime() + defaultSlotDuration * 60000);
            }

            console.log("account:", account)
            const adjustedTimeSlot: TimeSlot = {
                _id: undefined,
                start: start,
                end: adjustedEnd,
                title: 'available',
                isFixed: false,
                isBooked: false,
                createdById: account?._id || ''
            };
            // setAvailability([...availability, adjustedTimeSlot]);
            setFetchedEvents([...fetchedEvents, adjustedTimeSlot]);


            console.log(adjustedTimeSlot)


            try {
                const response = await axios.post('/api/timeslots', {events: [adjustedTimeSlot]}, {
                    headers: {'Authorization': `Bearer ${token}`}
                });
                const savedTimeSlot = response.data.insertedEvents[0]; // returns the created object with _id
                console.log("before", fetchedEvents)

                console.log("saved time slot in handle select:", savedTimeSlot)
                setFetchedEvents([...fetchedEvents, {...adjustedTimeSlot, _id: savedTimeSlot._id}]);
                console.log("after", fetchedEvents)
                console.log("old selected timeslot:", selectedTimeSlot)
                // setSelectedTimeSlot(savedTimeSlot)
                // console.log("new selected timeslot:", selectedTimeSlot)

            } catch (error) {
                console.error("Error saving new timeslot:", error);
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
                console.log(fetchedEvents.length)
                setDeleteDialog(false);
                setDeleteOptionDialogOpen(false);
            }).catch(error => {
                console.error("Error deleting timeslot:", error);
            });
        }
    };


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
        console.log("selected clicked:", TimeSlot)
        if (TimeSlot.isBooked) {
            setViewBookedDialogOpen(true)
        } else {
            setActionDialogOpen(true);
        }
    };


    // updated
    const handleFixWeekly = async () => {
        if (selectedTimeSlot) {
            try {
                // Construct the URL for the PATCH request
                // const url = `/api/events/${selectedTimeSlot.id}/fixed`; // Assuming `id` is how you reference events
                console.log("selected Timeslot:", selectedTimeSlot)

                const updatedTimeSlot = {
                    ...selectedTimeSlot,
                    isFixed: true,

                    createdById: account?._id
                };


                // Send the PATCH request
                const response = await axios.patch("/api/timeslots", updatedTimeSlot, {
                    headers: {'Authorization': `Bearer ${token}`} // Include auth token if needed
                });

                // Log the response data or handle it as needed
                console.log("Updated and future instances added:", response.data);

                // fetchEvents();

                const newFetchedEvents = fetchedEvents.map(event =>
                    event._id === selectedTimeSlot._id ? { ...event, isFixed: true } : event
                );

                setFetchedEvents(newFetchedEvents);

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

    const handleViewBookedDialogClose = () => {
        setViewBookedDialogOpen(false);
    };

    const fetchEvents = async (start: Date, end: Date) => {
        try {
            console.log("start and end in fetchEvents frontend:",start.toISOString(), end.toISOString())
            const response = await axios.get('/api/timeslots', {
                headers: {'Authorization': `Bearer ${token}`},
                params: {start: start.toISOString(), end: end.toISOString()}
            });
            console.log("fetchEvents frontend start and end:", start, end)
            const allEvents = response.data.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                isBooked: event.isBooked,
                transitStart: event.transitStart ? new Date(event.transitStart) : undefined,
                transitEnd: event.transitEnd ? new Date(event.transitEnd) : undefined
            }));
            const bookedEvents = allEvents.filter((event: TimeSlot) => event.isBooked);
            const editableEvents = allEvents.filter((event: TimeSlot) => !event.isBooked);
            // setBookedEvents(bookedEvents);
            // setAvailability(editableEvents);
            console.log("fetched before", fetchedEvents)

            setFetchedEvents(allEvents)
            console.log("all events", allEvents)
            console.log("fetched after", fetchedEvents)

        } catch (error) {
            console.error("Error fetching timeslots:", error);
        }
    };


    const handleRangeChange = (range: RangeType) => {
        if (Array.isArray(range)) {
            const start = startOfDay(range[0]);
            const end = endOfDay(range[range.length - 1]);
            console.log("end", end)

            const lastDate = new Date(Math.max(.../*availability*/fetchedEvents.map(slot => slot.end.getTime())));
            fetchEvents(start, end)

            console.log("fetched events after range change,", fetchedEvents)

            // if (end > lastDate) {
            //     console.log("need to extend calendar, here is frontend")
            axios.post('/api/timeslots/extend', {
                // start: lastDate,
                start: start,
                end: end,
                // end: moment(lastDate).add(6, 'months').toDate(),
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(() => {
                // no need to fetch again i guess
                // fetchEvents(start, end)
            }).catch(error => {
                console.error("Error extending fixed slots:", error);
            });
            // } else {
            //     fetchEvents(start, end)
            // }
        }
    };

    // styling for the calendar
    const eventPropGetter = (event: TimeSlot) => {
        if (event.isBooked) {
            // Check for transit times
            // const hasTransit = event.transitStart && event.transitEnd;

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
                        // pointerEvents: 'none' as 'none',
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

        // Style for editable events
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


    const scrollToTime = new Date();
    scrollToTime.setHours(9, 0, 0, 0);


    // const CustomToolbar = ({ label, onNavigate, onView }: ToolbarProps<TimeSlot>) => {
    //     const currentYear = new Date().getFullYear();
    //
    //     return (
    //         <div className="rbc-toolbar">
    //   <span className="rbc-btn-group">
    //     <button type="button" onClick={() => onNavigate(NavigateAction.PREVIOUS)}>Back</button>
    //     <button type="button" onClick={() => onNavigate(NavigateAction.TODAY)}>Today</button>
    //     <button type="button" onClick={() => onNavigate(NavigateAction.NEXT)}>Next</button>
    //   </span>
    //             <span className="rbc-toolbar-label">{label} - {currentYear}</span>
    //             <span className="rbc-btn-group">
    //     <button type="button" onClick={() => onView('week')}>Week</button>
    //     <button type="button" onClick={() => onView('month')}>Month</button>
    //   </span>
    //         </div>
    //     );
    // };


    let formats = {
        dateFormat: 'dd',

        // dayFormat: (date: Date, culture: any, localizer: any) =>
        //     localizer.format(date, 'DDD', culture),

        // dayFormat: (date: Date, culture: string,) =>
        //     localizer.format(date, 'DDD', culture),
        //
        // dayRangeHeaderFormat: ({ start, end }:{start: Date, end:Date}, culture:any) =>
        //     `${localizer.format(start, 'MMM dd', culture)} — ${localizer.format(end, 'MMM dd, yyyy', culture)}`, // Format range as "Oct 01 — Oct 07, 2022".

        // weekRangeHeaderFormat: (date:Date, culture: any) =>
        //     localizer.format(date, 'MMMM yyyy', culture), // Full month and year, e.g., "October 2022".
        //
        // monthHeaderFormat: (date:Date, culture:any) =>
        //     localizer.format(date, 'MMMM yyyy', culture), // Full month and year, e.g., "October 2022".
        //
        // yearHeaderFormat: (date:Date, culture:any) =>
        //     localizer.format(date, 'yyyy', culture) // Year only, e.g., "2022".

        dayRangeHeaderFormat: ({ start, end }:{start: Date, end:Date}, culture:any) =>
            `${localizer.format(start, 'MMM dd', culture)} — ${localizer.format(end, 'MMM dd, yyyy', culture)}`, // Short format for week range "Oct 01 — Oct 07"

    }



    const handleDrillDown = (event: any) => {
        // Prevent any drill down action.
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
                events={fetchedEvents/*[...fetchedEvents, ...availability]*/}
                startAccessor={getStartAccessor}
                endAccessor={getEndAccessor}
                style={{height: 520}}
                formats = {formats}
                // onEventDrop={handleEventDrop}
                // onEventResize={handleEventResize}
                onDrillDown={handleDrillDown}
                selectable
                onSelectSlot={handleSelect}
                onSelectEvent={handleSelectTimeSlot}
                onRangeChange={handleRangeChange}
                eventPropGetter={eventPropGetter}
                // backgroundEvents={bookedEvents}
                className="bg-black-300" // Apply Tailwind class here
                // components={{
                //     week: {
                //         header: MyCustomWeekDateHandler,
                //     },
                // }}
                // components={{
                //     event: ({ event }) => <EventTooltip event={event} />
                // }}
                //     components={{
                //         event: CustomEvent
                //     }}
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
            {/*<div>*/}
            {/*    /!*<button onClick={handleAction}>Do Something</button>*!/*/}
            {/*    <AlertCustomized alert={alert} closeAlert={closeAlert}/>*/}
            {/*</div>*/}
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
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <p>{selectedTimeSlot?.title}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialogOpen(false)}>Close</Button>
                    {/* Include Edit button logic here if needed */}

                    {/*todo: make */}
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
                    The new timeslot clashes with an existing timeslot or is adjusted to meet the minimum slot duration.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClashDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>

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
                            state: { redirectPath: location }
                        })}>View Job Details</Button>
                    )}
                    {selectedTimeSlot?.requestId && (
                        <Button onClick={() => navigate(`/incoming/requests/${selectedTimeSlot.requestId}`,{
                            state: { redirectPath: location }
                        })}>View Request Details</Button>
                    )}
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
