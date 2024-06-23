import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Job } from '../models/Job';
import { GoStarFill } from 'react-icons/go';
import BlackButton from './inputs/blackbutton';
import Avatar from '@mui/material/Avatar';
import { Divider } from '@mui/material';
import { JobStatus } from '../models/enums';

interface MediaCardProps {
  job: Job;
  onClose: () => void;
  onComplete: (job: Job) => void;
  onCancel: (job: Job) => void;

}

const MediaCard: React.FC<MediaCardProps> = ({ job, onClose, onComplete, onCancel }) => {
  const renderButton = () => {
    switch (job.status) {
      case JobStatus.open:
        return (
          <>
          <BlackButton text="Mark as completed" onClick={() => onComplete(job)} sx={{ marginRight:"1rem" }}/>
          <BlackButton text="Cancel Job" onClick={() => onCancel(job)} sx={{ marginRight:"1rem" }}/>
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
          <Avatar alt={job.provider.firstName + " " + job.provider.lastName} src={job.providerImage} sx={{ width: 100, height: 100, marginRight: '1rem' }} />
          <div style={{ marginRight: '1rem' }}>
            <Typography variant="h6" >
              Request Detail
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: '0.5rem' }}>
              Requestor: {job.provider.firstName + " " + job.provider.lastName}
            </Typography>
          </div>
          <div className='flex space-x-1 items-center'>
            <div style={{ marginRight: '0.25rem' }}>
              <GoStarFill className='text-yellow-500'/>
            </div>
            <Typography variant="body2" color="text.secondary">
              {job.rating}
            </Typography>
          </div>
        </div>
        <Divider sx={{marginBottom:'1rem'}}/>
        <Typography variant="body2">
          Request ID: {job._id}
        </Typography>
        <Typography variant="body2">
          Service Type: {job.serviceType}
        </Typography>
        <Typography variant="body2">
          Appointment Time: {job.appointmentStartTime.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: '2rem'}}>
          Service Fee: {job.serviceFee}
        </Typography>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Status: {job.status}
        </Typography>
        <Divider sx={{marginBottom:'1rem'}}/>
        <Typography variant="body2" sx={{marginBottom:'1rem'}}>
          Description: {job.description}
        </Typography>
        {renderButton()}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
