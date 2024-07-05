import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { useBooking, BookingDetails } from '../../contexts/BookingContext';
import {Account} from "../../models/Account";
import AvailabilityCalendarBooking from "../../components/AvailabilityCalendarBooking";


interface SelectTimeslotProps {
    onNext: () => void;
    onBack: () => void;
    bookingDetails: BookingDetails;
}

function SelectTimeslot({ onNext, onBack, bookingDetails }: SelectTimeslotProps) {
    const {setProvider,
    setRequestedBy, setSelectedServiceDetails, setTimeAndDuration } = useBooking();
    const navigate = useNavigate();
    const { id } = useParams(); //use this to then make a post request to the user with the id to get the user data

    // review-and-confirm/:id

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
    return (
        <Container>
            <Box sx={{ display: 'center', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{width: '70%'}}>
                    <Typography variant="h6" gutterBottom>
                        Step 2 of 3
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Select time
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="outlined" onClick={onBack}>Back</Button>
                        {/*<Button variant="contained" onClick={onNext}>Next</Button>*/}
                    </Box>
                    {/*<Grid container spacing={2}>*/}
                    {/*    /!* Sample dates *!/*/}
                    {/*    {['11', '12', '16', '17', '18', '19', '23', '24', '25', '26', '30', '31'].map((date) => (*/}
                    {/*        <Grid item key={date} onClick={() => handleDateClick(date)}>*/}
                    {/*            <Button variant={date === selectedDate ? 'contained' : 'outlined'}>*/}
                    {/*                {`May ${date}`}*/}
                    {/*            </Button>*/}
                    {/*        </Grid>*/}
                    {/*    ))}*/}
                    {/*</Grid>*/}
                    {/*<Box sx={{ mt: 4 }}>*/}
                    {/*    /!* Available time slots *!/*/}
                    {/*    {availableTimes.map((time) => (*/}
                    {/*            <Card key={time} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => {}}>*/}
                    {/*            <CardContent>*/}
                    {/*            <Link to={`/review-and-confirm/${id}`}>*/}
                    {/*                <Typography>{time}</Typography>*/}
                    {/*                </Link>*/}
                    {/*            </CardContent>*/}
                    {/*            </Card>*/}


                    {/*    ))}*/}
                    {/*</Box>*/}
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 4, mb: 4 }}>
                        <Typography variant="h4">
                            Book from provider
                        </Typography>
                    </Box>
                    <AvailabilityCalendarBooking
                        Servicetype={bookingDetails?.serviceType}
                        defaultSlotDuration={bookingDetails.serviceOffering?.baseDuration || 60}
                        defaultTransitTime={bookingDetails.serviceOffering?.bufferTimeDuration || 30}
                        onNext={onNext}
                        // globalAvailabilities={globalAvailabilities}
                    />
                </Box>
                <Box sx={{width: '20%'}}>
                    <Card>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">{`${bookingDetails.provider?.firstName} ${bookingDetails.provider?.lastName}`}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.serviceOffering?.serviceType}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.price}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default SelectTimeslot;
