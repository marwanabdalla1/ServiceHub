import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Request } from '../models/Request';
import { GoStarFill } from 'react-icons/go';
import BlackButton from './inputs/blackbutton';
import Avatar from '@mui/material/Avatar';
import { Divider } from '@mui/material';

interface MediaCardProps {
  request: Request;
  onClose: () => void;
  onAccept: (request: Request) => void;
  onDecline: (request: Request) => void;
  onProposeNewTime: (request: Request, newTime: Date) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ request, onClose, onAccept,onDecline, onProposeNewTime }) => {
  const renderButton = () => {
    switch (request.status) {
      case 'Pending':
        return (
          <>
          <BlackButton text="Accept" onClick={onClose} sx={{ marginRight:"1rem" }}/>
          <BlackButton text="Decline" onClick={onClose} sx={{ marginRight: "1rem" }} />
          <BlackButton text="Propose New Time" onClick={onClose}/>
          </>
        );
      default:
        return (
          <BlackButton text="Close" onClick={onClose} />
        );
    }
  };
  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Avatar alt={request.requestor} src={request.requestorImage} sx={{ width: 100, height: 100, marginRight: '1rem' }} />
          <div style={{ marginRight: '1rem' }}>
            <Typography variant="h6" >
              Request Detail
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
              Requestor: {request.requestor}
            </Typography>
          </div>
          <div className='flex space-x-1 items-center'>
            <div style={{ marginRight: '0.25rem' }}>
              <GoStarFill className='text-yellow-500'/>
            </div>
            <Typography variant="body2" color="text.secondary">
              {request.rating}
            </Typography>
          </div>
        </div>
        <Divider sx={{marginBottom:'1rem'}}/>
        <Typography variant="body2">
          Request ID: {request.requestId}
        </Typography>
        <Typography variant="body2">
          Service Type: {request.serviceType}
        </Typography>
        <Typography variant="body2">
          Appointment Time: {request.appointmentTime.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '2rem'}}>
          Service Fee: {request.serviceFee}
        </Typography>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Status: {request.status}
        </Typography>
        <Divider sx={{marginBottom:'1rem'}}/>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Description: {request.description}
        </Typography>
        {renderButton()}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
