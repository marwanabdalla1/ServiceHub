import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Card, CardContent, Container, Box, Typography, Grid, Button } from '@mui/material';
import { useRequest } from '../context/RequestContext';
import { ServiceType } from '../models/enums';
import NewTimeslotRequestMediaCard from '../components/NewTimeslotRequestMediaCard'; // Import the NewTimeslotRequestMediaCard component

function UpdateTimeslot() {
  const { requestDetails, setSelectedTime, selectedDate, setSelectedDate, availableTimes, setAvailableTimes } = useRequest();
  const navigate = useNavigate();

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    //temporarily the dates are assumed to all be within the current month

    let formattedDate = selectedDate ? selectedDate : "";
    if (!selectedDate) {
      formattedDate = new Date().getDate().toString().padStart(2, '0');
      setSelectedDate(formattedDate);
    }
    
    // Format the new appointment date and time
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const selectedDay = formattedDate.padStart(2, '0');

    const newAppointment = `${currentYear}-${currentMonth}-${selectedDay}T${time}:00`;
    console.log(newAppointment);
    requestDetails.updatedAppointmentTime = new Date(newAppointment);
    navigate('/proposeNewTime');
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
            Propose New Timeslot
          </Typography>
          <Typography variant="h4" gutterBottom>
            Select time
          </Typography>
          <Grid container spacing={2}>
            {/* Sample dates */}
            {['11', '12', '16', '17', '18', '19', '23', '24', '25', '26', '30', '31'].map((date) => (
              <Grid item key={date} onClick={() => handleDateClick(date)}>
                <Button variant={date === selectedDate ? 'contained' : 'outlined'}>
                  {`June ${date}`}
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
      </Box>
    </Container>
  );
}

export default UpdateTimeslot;
