import React from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {Container, Box, Typography, Card, CardContent, Grid, Button} from '@mui/material';
import {useBooking, BookingDetails} from '../../contexts/BookingContext';
import AvailabilityCalendarBooking from "../AvailabilityCalendarBooking";


interface SelectTimeslotProps {
    onNext: () => void;
    handleCancel: () => void;
    bookingDetails: BookingDetails;
}

function SelectTimeslot({onNext, handleCancel, bookingDetails}: SelectTimeslotProps) {
    const {
        setProvider,
        setRequestedBy, setSelectedServiceDetails, setTimeAndDuration
    } = useBooking();
    const navigate = useNavigate();
    const {id} = useParams(); //use this to then make a post request to the user with the id to get the user data


    // //this should be optional depending on the token
    // const handleTimeClick = (time: string) => {
    //     setSelectedTime(time);
    //     // navigate('/create-account-or-sign-in');
    // };
    //
    // const handleDateClick = (date: string) => {
    //
    //     // this should have some data added from the previous page (see implementation from proivde service to select availability )
    //
    //     setSelectedDate(date);
    //     // Update available times based on the selected date
    //     // This is a placeholder. Replace with actual logic to fetch available times.
    //     const newAvailableTimes = [
    //         '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
    //     ];
    //     setAvailableTimes(newAvailableTimes);
    // };
    //

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
            {/*<Box sx={{width: '100%', display:"flex", flexDirection:"row", justifyContent: "space-between"}}>*/}
            {/*<Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 5 }}>*/}
            {/*    <Button variant="outlined" onClick={onBack}>Back</Button>*/}
            {/*    /!*<Button variant="contained" onClick={onNext}>Next</Button>*!/*/}
            {/*</Box>*/}

            {/*</Box>*/}
            <Typography variant="h4" gutterBottom>
                Select time
            </Typography>

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
