import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { ServiceRequest as Request } from '../models/ServiceRequest';
import BlackButton from './inputs/blackbutton';
import { ServiceType, RequestStatus } from '../models/enums';

interface RequestRowProps {
  request: Request;
  onViewDetails: (request: Request) => void;
}

const RequestRow: React.FC<RequestRowProps> = ({ request, onViewDetails }) => {
    const formatDateTime = (date: any) => {
        if (!(date instanceof Date)) date = new Date(date);
        return date.toLocaleString('en-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit', // hour in 2-digit format
            minute: '2-digit', // minute in 2-digit format
            hour12: false // use AM/PM
        });
    };

    return (
    <TableRow>
      <TableCell>{request.serviceType}</TableCell>
      <TableCell>{RequestStatus[request.requestStatus]}</TableCell>
        <TableCell>{formatDateTime(request.appointmentStartTime)}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(request)}/>
      </TableCell>
    </TableRow>
  );
};

export default RequestRow;



