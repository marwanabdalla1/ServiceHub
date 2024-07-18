import React, {useState, useEffect} from 'react';
import {Calendar, dateFnsLocalizer, SlotInfo} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../calendarStyles.css';
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
import {useAuth} from '../../contexts/AuthContext';
import {BookingDetails, useBooking} from '../../contexts/BookingContext';
import {ServiceType} from "../../models/enums";
import {Timeslot} from "../../models/Timeslot";
import {bookTimeSlot, BookingError, changeTimeSlot} from '../../services/timeslotService';
import useAlert from '../../hooks/useAlert';
import AlertCustomized from "../AlertCustomized"; // Adjust the path as necessary


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
    const providerId = mode === 'change' ? providerIdInput : bookingDetails.provider?._id;
    const requestId = mode === 'change' ? requestIdInput : null;

    const {alert, triggerAlert, closeAlert} = useAlert(3000);
    const [availability, setAvailability] = useState<Timeslot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<Timeslot | null>(null);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [clashDialogOpen, setClashDialogOpen] = useState({open: false, message: ''});
    const {token} = useAuth();

    const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
    const maxDate = addMonths(new Date(), 3);  // Maximum date set to 3 months from today

    const [nextAvailable, setNextAvailable] = useState<Date | undefined>(undefined);


    // for directly jumping to the next availability upon consumer booking
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


    // get provider's avaiability schedule
    /**
     * @param options: optinally include the start and end of the timeframe of the events we want to fetch (e.g. one single week)
     */
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

            const events = response.data.filter((event: any) => { //filter those that are longer than the default duration
                const startTime = new Date(event.start);
                const endTime = new Date(event.end);
                const durationInMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
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


    // set the date to jump to
    useEffect(() => {
        if (!currentDate && nextAvailable) { // If currentDate is not set yet
            setCurrentDate(nextAvailable); // Initially set to nextAvailable
        }
    }, [nextAvailable]);


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

            // If the selected duration is less than the default duration, adjust the endTime so that it will have the length of the default duration
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

            // Check if the combined range of these slots covers the entire requested period
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
                setSelectedTimeSlot(newTimeSlot);
            } else {
                setClashDialogOpen({
                    open: true,
                    message: "Provider not available! This could be due to the need to adjust to minimum slot duration."
                });
            }

        } catch (error: any) {
            return;
        }
    };


    const confirmBooking = async () => {
        if (!selectedTimeSlot) {
            triggerAlert("No timeslot selected", "error");
            return;
        }

        if (!selectedTimeSlot.transitEnd || !selectedTimeSlot.transitStart) {
            console.error("no transit time included!")
        }

        // creating a booking
        if (mode === "create") {
            setTimeAndDuration(selectedTimeSlot);
            onNext();
        }

        // changing the timeslot of an existing booking
        if (mode === "change") {
            try {
                const timeslotResponse = await changeTimeSlot(selectedTimeSlot, token)

                triggerAlert("Success", "Timeslot updated successfully! You will be redirected to your requests soon...", 'success', 3000, 'dialog', 'center', `/outgoing/requests/${requestId}`);
            } catch (error: any) {
                if (error instanceof BookingError && error.code === 409) {
                    triggerAlert('Timeslot Unavailable', "Unfortunately, the selected timeslot is no longer available. Please select another time.", "error");
                } else {
                    // alert('An error occurred while confirming your booking. Please try again.');
                    triggerAlert('Error', "Failed to update timeslot. Please try again later", "error");
                }
            }

        }
    };


    const handleSelectTimeSlot = (TimeSlot: Timeslot) => {
        setDeleteDialog(true);
    };

    const handleClose = () => {
        setDeleteDialog(false);
    };

    const handleClashDialogClose = () => {
        setClashDialogOpen({open: false, message: ""});
    };

    const handleRangeChange = (range: RangeType | undefined) => {
        if (!range) {
            console.log("range undefined")
        }
        try {
            if (Array.isArray(range)) {
                const start = startOfDay(range[0]);
                const end = endOfDay(range[range.length - 1]);


                fetchAndSetAvailability({start, end});

                // check if we need to extend the saved timeslots in the DB
                // ( fixed events are saved for the upcoming 6 months until someone navigates to a time beyond that, then more future timeslots will be generated )
                axios.post('/api/timeslots/extend', {
                    start: start,
                    end: end,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

            }
        } catch (error: any) {
            return;
        }
    };


    let validEvents: Timeslot[] = [];
    if (selectedTimeSlot) {
        validEvents = [selectedTimeSlot]
    }


    const scrollToTime = new Date();
    scrollToTime.setHours(9, 0, 0, 0);

    // formatting displayed calendar header
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
                scrollToTime={scrollToTime} // Calendar will scroll to 9:00 AM on load
                date={currentDate} //go to next availability
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

            {/*clash dialogs if consumer selects unavailable times*/}
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
