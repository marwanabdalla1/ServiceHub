import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Divider, TextField } from '@mui/material';
import { Request } from '../models/Request';
import { GoStarFill } from 'react-icons/go';
import BlackButton from './inputs/blackbutton';
import BlackButtonWithMargin from './inputs/blackbuttonWithMargin';

interface MediaCardProps {
  request: Request;
  onClose: () => void;
}

const IncomingRequestMediaCard: React.FC<MediaCardProps> = ({ request, onClose }) => {
  const [description, setDescription] = React.useState(request.description);

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Avatar alt={request.requestor} src={request.requestorImage} sx={{ width: 80, height: 80, marginRight: '1rem' }} />
          <div>
            <Typography variant="h6">
              {request.requestor}
            </Typography>
            <BlackButton text="User Profile" onClick={onClose} />
          </div>
          <div className='flex space-x-1 items-center' style={{ marginLeft: 'auto' }}>
            <div style={{ marginRight: '0.25rem' }}>
              <GoStarFill className='text-yellow-500' />
            </div>
            <Typography variant="body2" color="text.secondary">
              {request.rating}
            </Typography>
          </div>
        </div>
        <Divider sx={{ marginBottom: '1rem' }} />
        <Typography variant="body2">
          Request ID: {request.requestId}
        </Typography>
        <Typography variant="body2">
          Service Type: {request.serviceType}
        </Typography>
        <Typography variant="body2">
          Appointment Time: {request.appointmentTime.toLocaleString()}
        </Typography>
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
        <BlackButtonWithMargin text="Accept" onClick={onClose} />
        <BlackButton text="Decline" onClick={onClose} />
      </CardContent>
    </Card>
  );
};

export default IncomingRequestMediaCard;
