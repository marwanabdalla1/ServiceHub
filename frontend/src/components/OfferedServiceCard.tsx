import * as React from 'react';
import Card from '@mui/material/Card';
import CloseIcon from '@mui/icons-material/Close';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Job } from '../models/Job';
import { GoStarFill } from 'react-icons/go';
import BlackButton from './inputs/blackbutton';
import Avatar from '@mui/material/Avatar';
import { Divider } from '@mui/material';
import { JobStatus } from '../models/enums';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Account } from '../models/Account';
import { useEffect } from 'react';

interface MediaCardProps {
  offeredService: Job;
  provider: Account | null;
  receiver: Account | null;
  onClose: () => void;
  onComplete: (offeredService: Job) => void;
  onCancel: (offeredService: Job) => void;
  onReview: (offeredService: Job) => void;
  onRevoke: (offeredService: Job) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ offeredService, provider, receiver, onClose, onComplete, onCancel, onReview, onRevoke }) => {
  const {account, token, } = useAuth();
  
/*
  useEffect(() => {
    console.log(job.provider);
    axios.get<Account>(`/api/account/providers/${job.provider}`, {
      headers: {Authorization: `Bearer ${token}` }
    })
        .then(response => {
          console.log("getting provider info ...", response.data)
          setProvider(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch provider info:', error);
          setProvider(null);
        });
  });*/

  const renderButton = () => {
    //Check whether user in sign-in context is a provider
    console.log("Account ID: " + account?._id);
    console.log("Receiver ID: " + offeredService.receiver);
    console.log(account?._id === offeredService.receiver._id);
    if(offeredService.status === JobStatus.open && account?._id === provider?._id ){
        return (
          <>
          <BlackButton text="Mark as Completed" onClick={() => onComplete(offeredService)} sx={{ marginRight:"1rem" }}/>
          <BlackButton text="Cancel Service" onClick={() => onCancel(offeredService)} sx={{ marginRight:"1rem" }}/>
          </>
        );}
      if(offeredService.status === JobStatus.open && account?._id === receiver?._id ) {
          return(<>
          <BlackButton text="Cancel Service" onClick={onClose} />
          </>);
        }
        else if (offeredService.status === JobStatus.completed) {
          return(<>
            <BlackButton text="Write a Review" onClick={() => onReview(offeredService)} sx={{ marginRight:"1rem" }} />
            <BlackButton text="Revoke Completion" onClick={() => onRevoke(offeredService)} />
          </>);
        }
    else {
        console.log(offeredService.status);
        return (
          <BlackButton text="Close" onClick={onClose} />
        );

    }
  };
  return (
    <Card>
      <button
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer'
        }}
        onClick={onClose}
        aria-label="close"
      >
        <CloseIcon />
      </button>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Avatar alt={provider?.firstName + " " + provider?.lastName} src={provider?.profileImageUrl} sx={{ width: 100, height: 100, marginRight: '1rem' }} />
          <div style={{ marginRight: '1rem' }}>
            <Typography variant="h6" >
              Request Detail
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
              Provider: {provider?.firstName + " " + provider?.lastName}
            </Typography>
          </div>
          <div className='flex space-x-1 items-center'>
            <div style={{ marginRight: '0.25rem' }}>
              <GoStarFill className='text-yellow-500'/>
            </div>
            <Typography variant="body2" color="text.secondary">
              {offeredService.rating}
            </Typography>
          </div>
        </div>
        <Divider sx={{marginBottom:'1rem'}}/>
        <Typography variant="body2">
          Service Type: {offeredService.serviceType}
        </Typography>
        <Typography variant="body2">
          Appointment Time: {offeredService.appointmentStartTime.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '2rem'}}>
          Service Fee: {offeredService.serviceFee}
        </Typography>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Status: {offeredService.status}
        </Typography>
        <Divider sx={{marginBottom:'1rem'}}/>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Description: {offeredService.description}
        </Typography>
        {renderButton()}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
