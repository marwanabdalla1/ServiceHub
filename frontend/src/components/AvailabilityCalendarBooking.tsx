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
import {BookingDetails, useBooking} from '../contexts/BookingContext';
import {ServiceType} from "../models/enums";

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
    Servicetype: ServiceType | undefined;
    defaultSlotDuration: number;
    defaultTransitTime: number;
}

function AvailabilityCalendarBooking({ Servicetype, defaultSlotDuration, defaultTransitTime }: ServiceScheduleProps) {
    const {bookingDetails} = useBooking();
    const providerId = bookingDetails.provider?._id;

    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    // const [selectedTimeSlotWithTransit, setSelectedTimeSlotWithTransit] = useState<TimeSlot | null>(null);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [clashDialogOpen, setClashDialogOpen] = useState(false);
    const { token } = useAuth();

    // const [previewSlot, setPreviewSlot] = useState<Date | null>(null);
    // const [previewStart, setPreviewStart] = useState<Date | null>(null);
    // const [previewEnd, setPreviewEnd] = useState<Date| null>(null);



    // todo: modify this to actual provider id
    const temp_providerId = '66714d05e357cca1c8c449c1'
    console.log(token);
    useEffect(() => {
        axios.get(`/api/timeslots/${temp_providerId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {transitTime:defaultTransitTime}
        }).then(response => {
            console.log("getting availability data from provider...", response.data)
            // const events = response.data.map((event: any) => ({
            //     ...event,
            //     start: new Date(event.start),
            //     end: new Date(event.end),
            //     title: "Available",
            //     isBooked: event.isBooked,
            // }));
            // setAvailability(events);
            const events = response.data.filter((event: any) => { //filter those that are longer than the default duration
                const startTime = new Date(event.start);
                const endTime = new Date(event.end);
                const durationInMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
                return durationInMinutes > defaultSlotDuration;
            }).map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
                title: "Available",
                isBooked: event.isBooked,
            }));
            setAvailability(events);
        }).catch(error => {
            console.error("Error fetching timeslots:", error);
        });
    }, [token]);

    // const saveAvailability = () => {
    //     console.log('Submitted token' + token)
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

    // const handleSelect = ({ start, end }: SlotInfo) => {
    //     const newTimeSlot: TimeSlot = { start, end, title: Servicetype, isFixed: false, isBooked: false, createdById: '' };
    //     const isClashing = availability.some(TimeSlot =>
    //         (newTimeSlot.start < TimeSlot.end && newTimeSlot.end > TimeSlot.start)
    //     );
    //
    //     if (isClashing) {
    //         setClashDialogOpen(true);
    //     } else {
    //         let adjustedEnd = end;
    //         if (end.getTime() - start.getTime() < defaultSlotDuration * 60000) {
    //             adjustedEnd = new Date(start.getTime() + defaultSlotDuration * 60000);
    //         }
    //
    //         const adjustedTimeSlot: TimeSlot = { start: start, end: adjustedEnd, title: Servicetype, isFixed: false, isBooked: false, createdById: '' };
    //         setAvailability([...availability, adjustedTimeSlot]);
    //     }
    // };

    const handleSelect = ({ start, end }: SlotInfo) => {

        const startTime = new Date(start);
        let endTime = new Date(end);

        // Calculate the difference in minutes
        const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

        // If the selected duration is less than the default duration, adjust the endTime
        if (durationInMinutes < defaultSlotDuration) {
            endTime = new Date(startTime.getTime() + defaultSlotDuration * 60000); // Adds defaultSlotDuration in minutes
        }

        // Calculate required start and end time including transit
        const adjustedStart = new Date(startTime.getTime() - defaultTransitTime * 60000);
        const adjustedEnd = new Date(endTime.getTime() + defaultTransitTime * 60000);


        // setSelectedTimeSlot(transitTimeSlot)

        // Check if the original selected time is fully within an unbooked slot
        const isWithinAvailableSlot = availability.filter(slot =>
            !slot.isBooked &&
            startTime >= new Date(slot.start) &&
            endTime <= new Date(slot.end)
        );


        // // Gather all unbooked slots that overlap with the selected time
        // const overlappingSlots = availability.filter(slot =>
        //     !slot.isBooked &&
        //     adjustedEnd >= new Date(slot.start) &&
        //     adjustedStart <= new Date(slot.end)
        // );
        //
        // // Check if the combined range of these slots covers the entire requested period
        if (isWithinAvailableSlot.length > 0) {
            const newTimeSlot = {
                start: startTime,
                end: endTime,
                title: `${Servicetype}`,
                isFixed: false,
                isBooked: true,
                createdById: temp_providerId
            };
            setSelectedTimeSlot(newTimeSlot);
        } else {
            setClashDialogOpen(true);
        }

            // const transitTimeSlot = {
            //     start: adjustedStart,
            //     end: adjustedEnd,
            //     title: `${Servicetype} (including transit)`,
            //     isFixed: false,
            //     isBooked: true,
            //     createdById: temp_providerId
            // };
            // setSelectedTimeSlotWithTransit(transitTimeSlot);


        // // Check if there's at least one unbooked slot that can fully contain the selected time slot
        // const isWithinAvailableSlot = availability.some(slot =>
        //     !slot.isBooked &&
        //     adjustedStart >= new Date(slot.start) &&
        //     adjustedEnd <= new Date(slot.end)
        // );

        // const isAvailable = availability.every(slot => {
        //     // Check if the slot is booked or the requested time overlaps with booked slots
        //     return slot.isBooked === false && (adjustedEnd <= new Date(slot.start) || adjustedStart >= new Date(slot.end));
        // });
        //
        // if (!isAvailable) {
        //     setClashDialogOpen(true);
        // } else {
        //     const newTimeSlot: TimeSlot = { start: adjustedStart, end: adjustedEnd, title: Servicetype, isFixed: false, isBooked: true, createdById: '' };
        //     setSelectedTimeSlot(newTimeSlot);
        //     // Here you might call a function to update the backend
        //     bookTimeSlot(newTimeSlot);
        // }
    };

    const confirmBooking = () => {
        if (!selectedTimeSlot) {
            console.error("No timeslot selected");
            return;
        }

        // Adjust times for transit time before sending to the server
        const start = new Date(selectedTimeSlot.start.getTime() - defaultTransitTime * 60000);
        const end = new Date(selectedTimeSlot.end.getTime() + defaultTransitTime * 60000);

        const timeSlotWithTransit = {
            ...selectedTimeSlot,
            start,
            end,
            isBooked: true, // Now set as booked
            // requestId: //todo: can only be added once the request is created
        };

        bookTimeSlot(timeSlotWithTransit);
    };






    const bookTimeSlot = (timeSlot: TimeSlot) => {
        axios.post('/api/timeslots/book', timeSlot, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            // Update local state with new timeslots after booking
            console.log("timeslot booked successfully", response.data)
            // fetchAvailability();
        }).catch(error => {
            console.error("Error booking timeslot:", error);
        });
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

    const handleSelectTimeSlot = (TimeSlot: TimeSlot) => {
        // setSelectedTimeSlot(TimeSlot);
        // console.log("selectedTimeslot:", selectedTimeSlot)
        setDeleteDialog(true);
    };

    const handleClose = () => {
        setDeleteDialog(false);
    };

    const handleClashDialogClose = () => {
        setClashDialogOpen(false);
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
                    axios.get(`/api/timeslots/${temp_providerId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        params: {transitTime:defaultTransitTime}
                    }).then(response => {
                        const events = response.data.map((event: any) => ({
                            ...event,
                            start: new Date(event.start),
                            end: new Date(event.end),
                            title: "Available",
                            isBooked: event.isBooked,
                        }));
                        setAvailability(events);
                    }).catch(error => {
                        console.error("Error fetching timeslots:", error);
                    });
                }).catch(error => {
                    console.error("Error extending fixed slots:", error);
                });
            } else {
                axios.get(`/api/timeslots/${temp_providerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        start: start,
                        end: end,
                        transitTime:defaultTransitTime
                    }
                }).then(response => {
                    const events = response.data.map((event: any) => ({
                        ...event,
                        start: new Date(event.start),
                        end: new Date(event.end),
                        title: "Available",
                        isBooked: event.isBooked,
                    }));
                    setAvailability(events);
                }).catch(error => {
                    console.error("Error fetching timeslots:", error);
                });
            }
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


    let validEvents:TimeSlot[] = [];
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


    return (
        <div>
            <Calendar
                defaultView='week'
                views={['week']}
                step={15}
                localizer={localizer}
                // events={availability}

                backgroundEvents={availability}
                events={validEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
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
            <Dialog open={clashDialogOpen} onClose={handleClashDialogClose}>
                <DialogTitle>TimeSlot Clash</DialogTitle>
                <DialogContent>
                    Provider Not Available!
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClashDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
                {/*todo: edit the onClick*/}
                <Button variant="contained" color="primary" onClick={confirmBooking}>
                    Confirm Booking Time
                </Button>
            </Box>
        </div>
    );
}

export default AvailabilityCalendarBooking;
