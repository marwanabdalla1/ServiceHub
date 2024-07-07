import * as React from 'react';
import Card from '@mui/material/Card';
import CloseIcon from '@mui/icons-material/Close';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ServiceRequest as Request, ServiceRequest} from '../models/ServiceRequest';
import { GoStarFill } from 'react-icons/go';
import BlackButton from './inputs/blackbutton';
import Avatar from '@mui/material/Avatar';
import { Divider } from '@mui/material';
import { RequestStatus } from '../models/enums';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Account } from '../models/Account';
import axios from 'axios';
import { formatDateTime } from '../utils/dateUtils';

interface MediaCardProps {
  request: Request;
  onClose: () => void;
  onDecline: (request: Request) => void;
  onProposeNewTime: (request: Request, newTime: Date) => void;
  onCancel: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ request, onClose, onDecline, onProposeNewTime, onCancel }) => {
  
  const { account, token, isProvider } = useAuth();
  const navigate = useNavigate();

  const handleProposeNewTime = (request: ServiceRequest) => {
    navigate(`/change-booking-time/${request._id}`); // Navigate to the calendar to select a new Timeslot
  }
  
  const renderButton = () => {
if (request.requestStatus === RequestStatus.cancelled ){
          console.log("No Actions possible for CANCELLED requests!");
        }
        else if (request.requestStatus === RequestStatus.declined ){
          console.log("No Actions possible for DECLINED requests!");
        }
        else if (request.requestStatus === RequestStatus.accepted ){
          return(<BlackButton text="Cancel Request" onClick={onCancel} sx={{ marginRight:"1rem" }}/>);
        }
        else if (request.requestStatus === RequestStatus.requestorActionNeeded ){
            return(
                <>
                <BlackButton text="Cancel Request" onClick={onCancel} sx={{ marginRight:"1rem" }}/>
                <BlackButton text="Action Needed: Change Time" onClick={() => handleProposeNewTime(request)} /> </>
            );
        }
         else {
          console.log(request);
        return (
          <>
          <BlackButton text="Cancel Request" onClick={onCancel} sx={{ marginRight:"1rem" }}/>
          </>
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
          <Avatar alt={request.requestedBy.firstName + " " + request.requestedBy.lastName} src={request.profileImageUrl} sx={{ width: 100, height: 100, marginRight: '1rem' }} />
          <div style={{ marginRight: '1rem' }}>
            <Typography variant="h6" >
              Request Detail
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
              Requestor: {request.requestedBy.firstName + " " + request.requestedBy.lastName }
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
          Service Type: {request.serviceType}
        </Typography>
          <Typography variant="body2">
              Appointment Start Time: {formatDateTime(request.timeslot?.start)}
          </Typography>
          <Typography variant="body2">
              Appointment End Time: {formatDateTime(request.timeslot?.end)}
          </Typography>
        <Typography variant="body2" sx={{ marginBottom: '2rem'}}>
          Service Fee: {request.serviceFee}
        </Typography>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Status: {request.requestStatus}
        </Typography>
        <Divider sx={{marginBottom:'1rem'}}/>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Description: {request.comment}
        </Typography>
        {renderButton()}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
