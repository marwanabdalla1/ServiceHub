import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { useBooking } from '../../context/BookingContext';

function SelectTimeslot() {
    const { bookingDetails, setSelectedTime, selectedDate, setSelectedDate, availableTimes, setAvailableTimes } = useBooking();
    const navigate = useNavigate();

    const handleTimeClick = (time: string) => {
        setSelectedTime(time);
        navigate('/create-account-or-sign-in');
    };

    const handleDateClick = (date: string) => {
        setSelectedDate(date);
        // Update available times based on the selected date
        // This is a placeholder. Replace with actual logic to fetch available times.
        const newAvailableTimes = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
        ];
        setAvailableTimes(newAvailableTimes);
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Step 1 of 3
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Select time
                    </Typography>
                    <Grid container spacing={2}>
                        {/* Sample dates */}
                        {['11', '12', '16', '17', '18', '19', '23', '24', '25', '26', '30', '31'].map((date) => (
                            <Grid item key={date} onClick={() => handleDateClick(date)}>
                                <Button variant={date === selectedDate ? 'contained' : 'outlined'}>
                                    {`May ${date}`}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 4 }}>
                        {/* Available time slots */}
                        {availableTimes.map((time) => (
                            <Card key={time} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => handleTimeClick(time)}>
                                <CardContent>
                                    <Typography>{time}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ width: 250 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">{bookingDetails.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.service}
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
