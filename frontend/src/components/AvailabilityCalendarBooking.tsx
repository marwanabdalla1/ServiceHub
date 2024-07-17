import React, {useState, useEffect} from 'react';
import {Calendar, dateFnsLocalizer, SlotInfo} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendarStyles.css';
import {format, startOfWeek, parseISO, getDay, startOfDay, endOfDay, addMonths, isAfter, isBefore} from 'date-fns';
import {enUS} from '@mui/material/locale';
import {
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,

} from '@mui/material';
import axios from 'axios';
import {useAuth} from '../contexts/AuthContext';
import {BookingDetails, useBooking} from '../contexts/BookingContext';
import {ServiceType} from "../models/enums";
import {Timeslot} from "../models/Timeslot";
import {bookTimeSlot, BookingError, changeTimeSlot} from '../services/timeslotService';
import useAlert from '../hooks/useAlert';
import AlertCustomized from "./AlertCustomized"; // Adjust the path as necessary


const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse: parseISO,
    startOfWeek: () => startOfWeek(new Date(), {weekStartsOn: 1}),
    getDay,
    locales,
});

// export interface TimeSlot {
//     start: Date;
//     end: Date;
//     transitStart: Date;
//     transitEnd: Date;
//     title: string;
//     isFixed?: boolean;  // Optional property to indicate if the TimeSlot is fixed
//     isBooked: boolean;
//     createdById: string | undefined;
// }

type RangeType = Date[] | { start: Date; end: Date };

interface ServiceScheduleProps {
    Servicetype: ServiceType | undefined | string;
    defaultSlotDuration: number;
    defaultTransitTime: number;
    providerIdInput: string | null | undefined;
    requestIdInput: string | null | undefined;
    mode: "create" | "change"; //"create" or "change"
    onCancelBooking?: () => void;
    onNext: () => void;
}

function AvailabilityCalendarBooking({
                                         Servicetype,
                                         defaultSlotDuration,
                                         defaultTransitTime,
                                         providerIdInput,
                                         requestIdInput,
                                         mode,
                                         onCancelBooking,
                                         onNext
                                     }: ServiceScheduleProps) {
    const {bookingDetails, setTimeAndDuration} = useBooking();
    // const providerId = bookingDetails.provider?._id;
    const providerId = mode === 'change' ? providerIdInput : bookingDetails.provider?._id;
    const requestId = mode === 'change' ? requestIdInput : null;

    const {alert, triggerAlert, closeAlert} = useAlert(3000);
    const [availability, setAvailability] = useState<Timeslot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<Timeslot | null>(null);
    // const [selectedTimeSlotWithTransit, setSelectedTimeSlotWithTransit] = useState<TimeSlot | null>(null);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [clashDialogOpen, setClashDialogOpen] = useState({open: false, message: ''});
    const {token} = useAuth();

    const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
    const maxDate = addMonths(new Date(), 3);  // Maximum date set to 3 months from today

    const [nextAvailable, setNextAvailable] = useState<Date | undefined>(undefined);




    const findNextAvailableSlot = (events: any[]) => {
        const now = new Date();
        const futureEvents = events.filter(event => new Date(event.start) > now);
        // Explicitly parse dates for sorting
        futureEvents.sort((a, b) => {
            const dateA = new Date(a.start).getTime();
            const dateB = new Date(b.start).getTime();
            return dateA - dateB;
        });
        return futureEvents.length > 0 ? futureEvents[0].start : now;
    };


    const fetchAndSetAvailability = (options: { start: any, end: any } | undefined) => {
        let params = {};
        if (options !== undefined) {
            const {start, end} = options;
            params = {start: start, end: end, transitTime: defaultTransitTime};
        } else {
            params = {transitTime: defaultTransitTime}
        }

        axios.get(`/api/timeslots/${providerId}`, {
            headers: {'Authorization': `Bearer ${token}`},
            params
        }).then(response => {
            console.log("getting availability data from provider...", response.data);

            const events = response.data.filter((event: any) => { //filter those that are longer than the default duration
                const startTime = new Date(event.start);
                const endTime = new Date(event.end);
                const durationInMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
                console.log(startTime, endTime, "duration in min:", durationInMinutes, defaultSlotDuration);
                return durationInMinutes > 0 && durationInMinutes >= defaultSlotDuration;
            }).map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                title: "Available",
                isBooked: event.isBooked,
            }));
            setAvailability(events);

            const nextDate = findNextAvailableSlot(events);
            if (nextDate) setNextAvailable(new Date(nextDate));
        }).catch(error => {
            console.error("Error fetching timeslots:", error);
        });
    };


    useEffect(() => {
        fetchAndSetAvailability(undefined);
    }, [token, providerId, defaultTransitTime]);


    // This effect runs only once when the component mounts
    useEffect(() => {
        if (!currentDate && nextAvailable) { // If currentDate is not set yet
            setCurrentDate(nextAvailable); // Initially set to nextAvailable
        }
    }, [nextAvailable]);

    console.log(bookingDetails);


    const handleNavigate = (date: Date) => {
        // todo: uncomment!
        // if (isBefore(date, new Date())) {
        //     console.log('Cannot go back past today');
        //     return; // Prevent navigation to past dates
        // }
        if (isAfter(date, maxDate)) {
            console.log('Cannot navigate beyond 3 months');
            return; // Prevent navigation beyond 3 months
        }
        setCurrentDate(date);
    };

    const handleSelect = ({start, end}: SlotInfo) => {
        try {
            if (!start || !end) {
                console.error("Slot information is incomplete.");
                return;
            }


            const now = new Date();

            const startTime = new Date(start);
            let endTime = new Date(end);

            // todo: uncomment!!
            // if (startTime < now) {
            //     setClashDialogOpen({open: true, message: "Cannot book a time in the past, please select another time."})
            //     resetSelection()
            //     return;
            // }


            // Calculate the difference in minutes
            const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

            // If the selected duration is less than the default duration, adjust the endTime
            if (durationInMinutes < defaultSlotDuration) {
                endTime = new Date(startTime.getTime() + defaultSlotDuration * 60000); // Adds defaultSlotDuration in minutes
            }

            // Calculate required start and end time including transit
            const transitStart = new Date(startTime.getTime() - defaultTransitTime * 60000);
            const transitEnd = new Date(endTime.getTime() + defaultTransitTime * 60000);


            // Check if the original selected time is fully within an unbooked slot
            const isWithinAvailableSlot = availability.filter(slot =>
                !slot.isBooked &&
                startTime >= new Date(slot.start) &&
                endTime <= new Date(slot.end)
            );

            // // Check if the combined range of these slots covers the entire requested period
            if (isWithinAvailableSlot.length > 0) {

                const newTimeSlot = new Timeslot(
                    `${Servicetype}`,
                    startTime,
                    endTime,
                    transitStart,
                    transitEnd,
                    false,
                    true,
                    requestId,
                    undefined, providerId,
                )
                // const timeslot = new Timeslot(...newTimeSlot)
                console.log("new time slot for booking:", newTimeSlot)
                setSelectedTimeSlot(newTimeSlot);
            } else {
                setClashDialogOpen({
                    open: true,
                    message: "Provider not available! This could be due to the need to adjust to minimum slot duration\n" +
                        `(${defaultSlotDuration} minutes)!`
                });
            }

        } catch (error: any) {
            console.log(error)
            return;
        }
    };


    const confirmBooking = async () => {
        if (!selectedTimeSlot) {
            console.error("No timeslot selected");
            triggerAlert("No timeslot selected", "error");
            return;
        }

        if (!selectedTimeSlot.transitEnd || !selectedTimeSlot.transitStart) {
            console.error("no transit time included!")
        }

        if (mode === "create") {
            setTimeAndDuration(selectedTimeSlot);
            onNext();
        }

        if (mode === "change") {
            try {
                const timeslotResponse = await changeTimeSlot(selectedTimeSlot, token)
                console.log("Timeslot updated", timeslotResponse);

                triggerAlert("Success", "Timeslot updated successfully! You will be redirected to your requests soon...", 'success', 3000, 'dialog', 'center', `/outgoing/requests/${requestId}`);
            } catch (error: any) {
                console.error('Error changing Timeslot booking:', error);

                if (error instanceof BookingError && error.code === 409) {
                    triggerAlert('Timeslot Unavailable', "Unfortunately, the selected timeslot is no longer available. Please select another time.", "error");
                } else {
                    // alert('An error occurred while confirming your booking. Please try again.');
                    triggerAlert('Error', "Failed to update timeslot. Please try again later", "error");
                }
            }

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

    const handleSelectTimeSlot = (TimeSlot: Timeslot) => {
        // setSelectedTimeSlot(TimeSlot);
        // console.log("selectedTimeslot:", selectedTimeSlot)
        setDeleteDialog(true);
    };

    const handleClose = () => {
        setDeleteDialog(false);
    };

    const handleClashDialogClose = () => {
        setClashDialogOpen({open: false, message: ""});
    };

    // Optional: Reset selection on clash dialog close or other conditions
    const resetSelection = () => {
        setSelectedTimeSlot(null);
    };
//
//
// }).then(response => {
//     console.log("getting availability data from provider...", response.data)
//     const events = response.data.map((event: any) => ({
//         ...event,
//         start: new Date(event.start),
//         end: new Date(event.end),
//         title: "Available",
//         isBooked: event.isBooked,
//     }));
//
    const handleRangeChange = (range: RangeType | undefined) => {
        if (!range) {
            console.log("range undefined")
        }
        try {
            if (Array.isArray(range)) {
                const start = startOfDay(range[0]);
                const end = endOfDay(range[range.length - 1]);

                // const lastDate = new Date(Math.max(...availability.map(slot => slot.end.getTime())));

                fetchAndSetAvailability({start, end});


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
                    // fetchAndSetAvailability({start, end});
                }).catch(error => {
                    console.error("Error extending fixed slots:", error);
                });

                // if (end > lastDate) {
                //     axios.post('/api/timeslots/extend', {
                //         start: lastDate,
                //         end: moment(lastDate).add(6, 'months').toDate(),
                //     }, {
                //         headers: {
                //             'Authorization': `Bearer ${token}`
                //         }
                //     }).then(() => {
                //         fetchAndSetAvailability(undefined);
                //     }).catch(error => {
                //         console.error("Error fetching timeslots:", error);
                //     });
                //     // }).catch(error => {
                //     //     console.error("Error extending fixed slots:", error);
                //     // });
                // } else {
                //     fetchAndSetAvailability({start, end});
                // axios.get(`/api/timeslots/${providerId}`, {
                //     headers: {
                //         'Authorization': `Bearer ${token}`
                //     },
                //     params: {
                //         start: start,
                //         end: end,
                //         transitTime:defaultTransitTime
                //     }
                // }).then(response => {
                //     const events = response.data.map((event: any) => ({
                //         ...event,
                //         start: new Date(event.start),
                //         end: new Date(event.end),
                //         title: "Available",
                //         isBooked: event.isBooked,
                //     }));
                //     setAvailability(events);
                // }).catch(error => {
                //     console.error("Error fetching timeslots:", error);
                // });
                // }
            }
        } catch (error: any) {
            console.log(error)
            return;
        }
    };

    // const eventPropGetter = (event: TimeSlot) => {
    //     const backgroundColor = event.isFixed ? 'purple' : 'blue';
    //     return { style: { backgroundColor } };
    // };

    // const eventPropGetter = (event: TimeSlot) => {
    //     const style = {
    //         backgroundColor: event.title.includes('transit') ? 'rgba(255, 0, 0, 0.5)' : 'blue',  // Red for transit-included, blue otherwise
    //         borderRadius: '5px',
    //         color: 'white',
    //         border: 'none',
    //     };
    //     return { style };
    // };

    // const eventPropGetter = (event: TimeSlot) => {
    //     if (!event.isBooked) {
    //         return {
    //             style: {
    //                 backgroundColor: 'rgba(211, 211, 211, 0.5)',  // Light gray color, semi-transparent
    //                 color: 'black',
    //                 border: 'none',
    //                 margin: 0,
    //                 borderRadius: 0,
    //             }
    //         };
    //     } else {
    //         return {
    //             style: {
    //                 backgroundColor: 'blue',  // Regular events are more prominently colored
    //                 color: 'white'
    //             }
    //         };
    //     }
    // };


    let validEvents: Timeslot[] = [];
    if (selectedTimeSlot) {
        validEvents = [selectedTimeSlot]
    }

    // This handles styling the 'selected' slot background in the Scheduler

    // slotPropGetter function to style slots based on availability
    // const slotPropGetter = (date: Date) => {
    //     // Check if this slot's date falls within any available ranges
    //     const isAvailable = availability.some((slot) => {
    //         const start = new Date(slot.start);
    //         const end = new Date(slot.end);
    //         return date >= start && date <= end;
    //     });
    //
    //     // Apply styles if the slot is within an available range
    //     if (isAvailable) {
    //         return {
    //             style: { backgroundColor: '#999', borderTop: '1px solid #999' },
    //         };
    //     } else{
    //         return {};
    //     }
    // };


    const scrollToTime = new Date();
    scrollToTime.setHours(9, 0, 0, 0);

    let formats = {
        dateFormat: 'dd',

        dayRangeHeaderFormat: ({start, end}: { start: Date, end: Date }, culture: any) =>
            `${localizer.format(start, 'MMM dd', culture)} — ${localizer.format(end, 'MMM dd, yyyy', culture)}`, // Short format for week range "Oct 01 — Oct 07"

    }

    const handleDrillDown = (event: any) => {
        // Prevent any drill down action.
        return;
    };
    return (

        <div>
            <AlertCustomized alert={alert} closeAlert={closeAlert}/>

            <Calendar
                defaultView='week'
                views={['week']}
                step={15}
                localizer={localizer}
                // events={availability}
                scrollToTime={scrollToTime} // Calendar will scroll to 9:00 AM on load
                date={currentDate} //go to next availability
                // onNavigate={date => setCurrentDate(date)} // Update internal state when manually navigating
                onNavigate={handleNavigate}
                formats={formats}
                onDrillDown={handleDrillDown}

                backgroundEvents={availability}
                events={validEvents}
                startAccessor="start"
                endAccessor="end"
                style={{height: 500}}
                selectable
                onSelectSlot={handleSelect}
                onSelectEvent={handleSelectTimeSlot}
                onRangeChange={handleRangeChange}
                // slotPropGetter={slotPropGetter}
                className="bg-black-300" // Apply Tailwind class here
            />
            {/*<Dialog open={deleteDialog} onClose={handleClose}>*/}
            {/*    <DialogTitle>Delete Slot?</DialogTitle>*/}
            {/*    <DialogContent>*/}
            {/*        {selectedTimeSlot && <p>{selectedTimeSlot.title}</p>}*/}
            {/*    </DialogContent>*/}
            {/*    <DialogActions>*/}
            {/*        /!*<Button onClick={handleClose}>Cancel</Button>*!/*/}
            {/*        /!*<Button onClick={handleFixWeekly}>Repeat Weekly</Button>*!/*/}
            {/*        /!*<Button onClick={handleDelete} color="secondary">Delete</Button>*!/*/}
            {/*    </DialogActions>*/}
            {/*</Dialog>*/}

            <Dialog open={clashDialogOpen.open} onClose={handleClashDialogClose}>
                <DialogTitle>Timeslot Unavailable</DialogTitle>
                <DialogContent>
                    {clashDialogOpen.message}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClashDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>
            <Box display="flex" justifyContent="flex-end" sx={{mt: 4}}>
                <Button variant="contained" color="primary" onClick={confirmBooking} disabled={!selectedTimeSlot}
                        sx={{mr: 2}}>
                    {mode === 'create' ? 'Confirm Booking Time' : 'Update Booking Time'}
                </Button>
                <Button variant="outlined" onClick={onCancelBooking}>Cancel </Button>
            </Box>
        </div>
    );
}

export default AvailabilityCalendarBooking;
