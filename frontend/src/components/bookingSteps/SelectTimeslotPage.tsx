import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {Container, Box, Typography, Card, CardContent, Grid, Button} from '@mui/material';
import {useBooking, BookingDetails} from '../../contexts/BookingContext';
import AvailabilityCalendarBooking from "../calendar/AvailabilityCalendarBooking";


interface SelectTimeslotProps {
    onNext: () => void;
    handleCancel: () => void;
    bookingDetails: BookingDetails;
}

// step 2
function SelectTimeslot({onNext, handleCancel, bookingDetails}: SelectTimeslotProps) {
    // color legend to be displayed
    const CalendarLegend = () => (
        <Box display="flex" justifyContent="center" alignItems="center" padding={2} bgcolor="background.paper">
            <Box display="flex" alignItems="center">
                <Box width={20} height={20} bgcolor="#bbf7d0" marginRight={1}/>
                <Typography>Available Time</Typography>
            </Box>

        </Box>
    );

    return (
        <>
            <Typography variant="h4" gutterBottom>
                Select time
            </Typography>

            {/*info to the consumer to let them know how long of a slot then need to choose*/}
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{mt: 2, mb: 2}}>
                <Typography variant="body2" gutterBottom marginBottom={2} style={{whiteSpace: 'pre-line'}}
                            sx={{flex: 6}}>
                    The default duration for this service
                    is {bookingDetails.serviceOffering?.baseDuration || 60} minutes. If you select a slot shorter than
                    this, it will be automatically extended to the default duration.
                    {"\n"}
                    Note that you can only book a slot up to three months in advance.
                </Typography>
                <CalendarLegend/>

            </Box>

            <AvailabilityCalendarBooking
                Servicetype={bookingDetails?.serviceType}
                providerIdInput={null}
                requestIdInput={null}
                mode={'create'}
                defaultSlotDuration={bookingDetails.serviceOffering?.baseDuration || 60}
                defaultTransitTime={bookingDetails.serviceOffering?.bufferTimeDuration || 30}
                onNext={onNext}
                onCancelBooking={handleCancel}
            />
        </>

    );
}

export default SelectTimeslot;
