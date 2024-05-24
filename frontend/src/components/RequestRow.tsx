import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { Request } from '../models/Request';
import BlackButton from './inputs/blackbutton';

interface RequestRowProps {
  request: Request;
  onViewDetails: (request: Request) => void;
}

const RequestRow: React.FC<RequestRowProps> = ({ request, onViewDetails }) => {
  return (
    <TableRow>
      <TableCell>{request.serviceType}</TableCell>
      <TableCell>{request.status}</TableCell>
      <TableCell>{request.appointmentTime.toLocaleDateString()}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(request)}/>
      </TableCell>
    </TableRow>
  );
};

export default RequestRow;
