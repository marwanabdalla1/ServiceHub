import React, { useState } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, User} from '../models/Account';
import { ServiceRequest as Request } from '../models/ServiceRequest';
import Sidebar from '../components/SideBarLists';
import { useRequest } from '../context/RequestContext';
import { Card, CardContent, Avatar, Typography, TextField, Divider, Box } from '@mui/material';
import BlackButton from '../components/inputs/blackbutton';
import { GoStarFill } from 'react-icons/go';
import { ServiceType } from '../models/enums';
import { useNavigate } from 'react-router-dom';

function ProposeNewtimePage() {
  const { requestDetails } = useRequest();
  const [description, setDescription] = useState(requestDetails.comment);
  const [duration, setDuration] = useState(requestDetails.duration);
  const navigate = useNavigate();

  const handleSendNewTimeProposed = () => {
    console.log('Send updated Request')
    //navigate('/update-timeslot'); // Navigate to the calendar to select a new Timeslot
  };

  const handleClose = () => {
    navigate('/incomingRequests'); // Navigate to the calendar to select a new Timeslot
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(parseFloat(event.target.value));
  };

  return (
    <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // Set height to fill the viewport vertically
    }}
  >
    <Card sx={{ maxWidth: 600 }}>
    <CardContent>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <Avatar alt={requestDetails.requestedBy.firstName + " " + requestDetails.requestedBy.lastName}
          src={requestDetails.requestedBy.profileImageUrl} sx={{ width: 80, height: 80, marginRight: '1rem' }} />
        <div>
          <Typography variant="h6">
            {requestDetails.requestedBy.firstName + " " + requestDetails.requestedBy.lastName}
          </Typography>
          <BlackButton text="User Profile" onClick={() => console.log('Navigate to User Profile')} />
        </div>
        <div className='flex space-x-1 items-center' style={{ marginLeft: 'auto' }}>
          <div style={{ marginRight: '0.25rem' }}>
            <GoStarFill className='text-yellow-500' />
          </div>
          <Typography variant="body2" color="text.secondary">
            {requestDetails.requestedBy.rating}
          </Typography>
        </div>
      </div>
      <Divider sx={{ marginBottom: '1rem' }} />
      <Typography variant="body2">
        Request ID: {requestDetails.serviceRequestId}
      </Typography>
      <Typography variant="body2">
        Service Type: {ServiceType[requestDetails.serviceType]}
      </Typography>
      <Typography variant="body2">
        Previous Appointment: <Typography component="span" sx={{ textDecoration: 'line-through', fontSize: '0.91rem' }}>{requestDetails.appointmentTime.toLocaleString()}</Typography>
          </Typography>
      {requestDetails.updatedAppointmentTime && <Typography variant="body2">
        Proposed Appointment: {requestDetails.updatedAppointmentTime.toLocaleString()}
      </Typography>}
      <TextField
        label="est. duration (h)"
        type="number"
        value={duration}
        onChange={handleDurationChange}
        placeholder={duration.toString()}
        InputProps={{ style: { height: '40px' }, inputProps: { step: '0.5' } }}
        sx={{ marginBottom: '1rem', marginTop: '1rem', width: '27%', maxHeight: 1 }}
      />
      <Divider sx={{ marginBottom: '1rem' }} />
      <Typography variant="body2" sx={{ marginBottom: '1rem' }}>
        Description:
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={description}
        onChange={handleDescriptionChange}
        placeholder="Enter description here..."
        sx={{ marginBottom: '1rem' }}
      />
      <BlackButton text="Send Updated Request" onClick={handleSendNewTimeProposed} sx={{ marginRight: "1rem" }} />
      <BlackButton text="Close" onClick={handleClose} />
    </CardContent>
  </Card>
   </Box>
  );
}

export default ProposeNewtimePage;
