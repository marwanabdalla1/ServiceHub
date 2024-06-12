
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Divider, TextField } from '@mui/material';
import { ServiceRequest as Request } from '../models/ServiceRequest';
import { GoStarFill } from 'react-icons/go';
import BlackButton from './inputs/blackbutton';
import { RequestStatus, ServiceType } from '../models/enums';
import { Job } from '../models/Job';
import { generateId } from './helperFunctions';
import {useNavigate} from "react-router-dom";
import { useRequest } from '../context/RequestContext';

interface MediaCardProps {
  request: Request;
  onClose: () => void;
}


const IncomingRequestMediaCard: React.FC<MediaCardProps> = ({ request, onClose }) => {
  const [description, setDescription] = useState(request.comment);
  const [appointmentTime, setAppointmentTime] = useState(request.appointmentTime);
  const [duration, setDuration] = useState(request.duration);
  const navigate = useNavigate();
  const { requestDetails } = useRequest();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(parseFloat(event.target.value));
  };

  function acceptRequest() {
    /*request.requestStatus =  RequestStatus.accepted;

    const job = new Job(generateId(), request.serviceType, 
                new Date(request.appointmentTime.getFullYear()+'-'
                      + request.appointmentTime.getMonth() + '-'
                      + request.appointmentTime.getDay()),
                request.serviceFee, JobStatus.open, request.comment, 
                request.provider, request.provider.profileImageUrl, request.provider.rating,
                request.);*/
  }

  function declineRequest() {

  }

  const handleProposeNewTime = () => {
    navigate('/update-timeslot'); // Navigate to the calendar to select a new Timeslot
    handleShowModal();
    
};

  const handleShowModal = () => {
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }


  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Avatar alt={ request.requestedBy.firstName + " " + request.requestedBy.lastName } 
                  src={request.requestedBy.profileImageUrl} sx={{ width: 80, height: 80, marginRight: '1rem' }} />
          <div>
            <Typography variant="h6">
              {request.requestedBy.firstName + " " + request.requestedBy.lastName}
            </Typography>
            <BlackButton text="User Profile" onClick={onClose} />
          </div>
          <div className='flex space-x-1 items-center' style={{ marginLeft: 'auto' }}>
            <div style={{ marginRight: '0.25rem' }}>
              <GoStarFill className='text-yellow-500' />
            </div>
            <Typography variant="body2" color="text.secondary">
              {request.requestedBy.rating}
            </Typography>
          </div>
        </div>
        <Divider sx={{ marginBottom: '1rem' }} />
        <Typography variant="body2">
          Request ID: {request.serviceRequestId}
        </Typography>
        <Typography variant="body2">
          Service Type: {request.serviceType}
        </Typography>
        <Typography variant="body2">
          Appointment Time: {request.appointmentTime.toLocaleString()}
        </Typography>
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
        <BlackButton text="Accept" onClick={acceptRequest} sx={{ marginRight:"1rem" }}/>
        <BlackButton text="Decline" onClick={declineRequest} sx={{ marginRight: "1rem" }} />
        <BlackButton text="Propose New Time" onClick={handleProposeNewTime}/>
      </CardContent>
    </Card>
  );
};

export default IncomingRequestMediaCard;
